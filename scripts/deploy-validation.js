#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const execAsync = promisify(exec);

// Import our validation modules
const { validateAllServices } = require('./validate-services');
const { runTests } = require('./test-endpoints');

// Configuration
const NGINX_CONFIG_PATH = '/etc/nginx/nginx.conf';
const BACKUP_DIR = '/tmp/nginx-backups';
const PROJECT_NGINX_CONFIG = path.join(__dirname, '../infrastructure/nginx/nginx.conf');

// Utility functions
async function createBackup() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `nginx-${timestamp}.conf`);
    
    await execAsync(`sudo cp ${NGINX_CONFIG_PATH} ${backupPath}`);
    console.log(`✅ Created backup: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Failed to create backup:', error.message);
    throw error;
  }
}

async function validateNginxConfig() {
  try {
    await execAsync('sudo nginx -t');
    console.log('✅ Nginx configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Nginx configuration validation failed:');
    console.error(error.stdout || error.message);
    return false;
  }
}

async function reloadNginx() {
  try {
    await execAsync('sudo systemctl reload nginx');
    console.log('✅ Nginx reloaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to reload nginx:', error.message);
    return false;
  }
}

async function rollbackNginx(backupPath) {
  try {
    await execAsync(`sudo cp ${backupPath} ${NGINX_CONFIG_PATH}`);
    await execAsync('sudo systemctl reload nginx');
    console.log('✅ Nginx configuration rolled back successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to rollback nginx:', error.message);
    return false;
  }
}

async function deployNginxConfig() {
  console.log('🚀 Starting nginx configuration deployment...\n');
  
  let backupPath = null;
  
  try {
    // Step 1: Create backup
    console.log('📦 Creating backup...');
    backupPath = await createBackup();
    
    // Step 2: Copy new configuration
    console.log('📋 Copying new configuration...');
    await execAsync(`sudo cp ${PROJECT_NGINX_CONFIG} ${NGINX_CONFIG_PATH}`);
    console.log('✅ Configuration copied');
    
    // Step 3: Validate configuration
    console.log('🔍 Validating configuration...');
    const isValid = await validateNginxConfig();
    
    if (!isValid) {
      console.log('🔄 Rolling back due to validation failure...');
      await rollbackNginx(backupPath);
      return false;
    }
    
    // Step 4: Reload nginx
    console.log('🔄 Reloading nginx...');
    const reloaded = await reloadNginx();
    
    if (!reloaded) {
      console.log('🔄 Rolling back due to reload failure...');
      await rollbackNginx(backupPath);
      return false;
    }
    
    console.log('✅ Nginx configuration deployed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    if (backupPath) {
      console.log('🔄 Attempting rollback...');
      await rollbackNginx(backupPath);
    }
    
    return false;
  }
}

async function buildServices() {
  console.log('🔨 Building services...\n');
  
  const services = ['auth-service', 'core-logistics'];
  
  for (const service of services) {
    try {
      console.log(`Building ${service}...`);
      const servicePath = path.join(__dirname, `../services/${service}`);
      await execAsync('npm run build', { cwd: servicePath });
      console.log(`✅ ${service} built successfully`);
    } catch (error) {
      console.error(`❌ Failed to build ${service}:`, error.message);
      return false;
    }
  }
  
  return true;
}

async function restartServices() {
  console.log('🔄 Restarting services...\n');
  
  try {
    // Check if PM2 is available
    await execAsync('which pm2');
    
    // Restart services
    await execAsync('pm2 restart auth-service core-logistics');
    console.log('✅ Services restarted with PM2');
    
    // Wait for services to start
    console.log('⏳ Waiting for services to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return true;
  } catch (error) {
    console.error('❌ Failed to restart services:', error.message);
    console.log('ℹ️  You may need to restart services manually');
    return false;
  }
}

async function runFullValidation() {
  console.log('🧪 Running full validation...\n');
  
  let allPassed = true;
  
  // Service validation
  console.log('1. Service Discovery Validation:');
  try {
    const serviceValidation = await validateAllServices();
    if (!serviceValidation.allHealthy) {
      allPassed = false;
    }
  } catch (error) {
    console.error('Service validation failed:', error.message);
    allPassed = false;
  }
  
  // Endpoint testing
  console.log('\n2. Endpoint Connectivity Testing:');
  try {
    await runTests();
  } catch (error) {
    console.error('Endpoint testing failed:', error.message);
    allPassed = false;
  }
  
  return allPassed;
}

// Main deployment function
async function deploy(options = {}) {
  console.log('🚀 Starting full deployment validation pipeline...\n');
  
  const {
    buildOnly = false,
    skipBuild = false,
    skipNginx = false,
    skipServices = false,
    skipValidation = false
  } = options;
  
  let success = true;
  
  try {
    // Step 1: Build services
    if (!skipBuild) {
      const buildSuccess = await buildServices();
      if (!buildSuccess) {
        console.error('❌ Build failed, aborting deployment');
        return false;
      }
    }
    
    if (buildOnly) {
      console.log('✅ Build-only deployment completed');
      return true;
    }
    
    // Step 2: Deploy nginx configuration
    if (!skipNginx) {
      const nginxSuccess = await deployNginxConfig();
      if (!nginxSuccess) {
        success = false;
      }
    }
    
    // Step 3: Restart services
    if (!skipServices) {
      const servicesSuccess = await restartServices();
      if (!servicesSuccess) {
        success = false;
      }
    }
    
    // Step 4: Run validation
    if (!skipValidation) {
      const validationSuccess = await runFullValidation();
      if (!validationSuccess) {
        success = false;
      }
    }
    
    // Final result
    if (success) {
      console.log('\n🎉 Deployment completed successfully!');
      console.log('All services are running and endpoints are accessible.');
    } else {
      console.log('\n⚠️  Deployment completed with issues.');
      console.log('Please check the logs above and fix any problems.');
    }
    
    return success;
    
  } catch (error) {
    console.error('❌ Deployment pipeline failed:', error.message);
    return false;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  args.forEach(arg => {
    switch (arg) {
      case '--build-only':
        options.buildOnly = true;
        break;
      case '--skip-build':
        options.skipBuild = true;
        break;
      case '--skip-nginx':
        options.skipNginx = true;
        break;
      case '--skip-services':
        options.skipServices = true;
        break;
      case '--skip-validation':
        options.skipValidation = true;
        break;
      case '--help':
        console.log(`
Usage: node deploy-validation.js [options]

Options:
  --build-only      Only build services, don't deploy
  --skip-build      Skip building services
  --skip-nginx      Skip nginx configuration deployment
  --skip-services   Skip service restart
  --skip-validation Skip final validation
  --help           Show this help message
        `);
        process.exit(0);
        break;
    }
  });
  
  deploy(options)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deploy, deployNginxConfig, buildServices, restartServices, runFullValidation };