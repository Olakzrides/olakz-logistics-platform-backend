#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Service configuration
const SERVICES = [
  { name: 'auth-service', port: 4001, expectedHost: '127.0.0.1' },
  { name: 'core-logistics', port: 4002, expectedHost: '127.0.0.1' }
];

// Utility function to check if a port is listening
async function checkPortListening(port) {
  try {
    // Try lsof first
    try {
      const { stdout } = await execAsync(`lsof -i :${port} -t`);
      return stdout.trim().length > 0;
    } catch (lsofError) {
      // Fallback to netstat if lsof fails
      try {
        const { stdout } = await execAsync(`netstat -tlnp 2>/dev/null | grep :${port}`);
        return stdout.includes(`:${port}`);
      } catch (netstatError) {
        // Fallback to ss if netstat fails
        try {
          const { stdout } = await execAsync(`ss -tlnp | grep :${port}`);
          return stdout.includes(`:${port}`);
        } catch (ssError) {
          console.warn(`⚠️  Could not check port ${port} - no suitable command available`);
          return false;
        }
      }
    }
  } catch (error) {
    return false;
  }
}

// Get detailed port information
async function getPortInfo(port) {
  const commands = [
    `lsof -i :${port}`,
    `netstat -tlnp | grep :${port}`,
    `ss -tlnp | grep :${port}`
  ];

  for (const cmd of commands) {
    try {
      const { stdout } = await execAsync(cmd);
      if (stdout.trim()) {
        return stdout.trim();
      }
    } catch (error) {
      // Continue to next command
    }
  }
  return 'No detailed information available';
}

// Check if service is responding
async function checkServiceHealth(port) {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      resolve({
        responding: true,
        statusCode: res.statusCode,
        healthy: res.statusCode === 200
      });
    });

    req.on('error', () => {
      resolve({
        responding: false,
        statusCode: null,
        healthy: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        responding: false,
        statusCode: null,
        healthy: false
      });
    });

    req.end();
  });
}

// Validate a single service
async function validateService(service) {
  console.log(`\n🔍 Validating ${service.name}...`);
  
  const result = {
    name: service.name,
    port: service.port,
    listening: false,
    responding: false,
    healthy: false,
    details: {},
    issues: []
  };

  // Check if port is listening
  result.listening = await checkPortListening(service.port);
  
  if (!result.listening) {
    result.issues.push(`Service not listening on port ${service.port}`);
    console.log(`❌ ${service.name} is not listening on port ${service.port}`);
    return result;
  }

  console.log(`✅ ${service.name} is listening on port ${service.port}`);

  // Get port details
  result.details.portInfo = await getPortInfo(service.port);
  
  // Check if service is responding
  const healthCheck = await checkServiceHealth(service.port);
  result.responding = healthCheck.responding;
  result.healthy = healthCheck.healthy;
  result.details.healthCheck = healthCheck;

  if (!result.responding) {
    result.issues.push('Service not responding to health checks');
    console.log(`❌ ${service.name} is not responding to health checks`);
  } else if (!result.healthy) {
    result.issues.push(`Service responding but unhealthy (status: ${healthCheck.statusCode})`);
    console.log(`⚠️  ${service.name} is responding but reports unhealthy status`);
  } else {
    console.log(`✅ ${service.name} is healthy and responding`);
  }

  return result;
}

// Main validation function
async function validateAllServices() {
  console.log('🚀 Starting service discovery validation...');
  
  const results = [];
  let allHealthy = true;

  for (const service of SERVICES) {
    const result = await validateService(service);
    results.push(result);
    
    if (!result.listening || !result.responding || !result.healthy) {
      allHealthy = false;
    }
  }

  // Print summary
  console.log('\n📊 Validation Summary:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    const status = (result.listening && result.responding && result.healthy) ? '✅' : '❌';
    console.log(`${status} ${result.name}:`);
    console.log(`   Port: ${result.port}`);
    console.log(`   Listening: ${result.listening ? 'Yes' : 'No'}`);
    console.log(`   Responding: ${result.responding ? 'Yes' : 'No'}`);
    console.log(`   Healthy: ${result.healthy ? 'Yes' : 'No'}`);
    
    if (result.issues.length > 0) {
      console.log(`   Issues:`);
      result.issues.forEach(issue => console.log(`     - ${issue}`));
    }
    console.log();
  });

  // Print recommendations
  if (!allHealthy) {
    console.log('🔧 Recommendations:');
    results.forEach(result => {
      if (!result.listening) {
        console.log(`- Start ${result.name} service (check PM2 or systemd)`);
        console.log(`- Verify ${result.name} is configured to bind to 127.0.0.1:${result.port}`);
      } else if (!result.responding) {
        console.log(`- Check ${result.name} logs for startup errors`);
        console.log(`- Verify firewall is not blocking port ${result.port}`);
      } else if (!result.healthy) {
        console.log(`- Check ${result.name} dependencies (database, external services)`);
        console.log(`- Review ${result.name} configuration and environment variables`);
      }
    });
  }

  return {
    allHealthy,
    results,
    summary: {
      total: results.length,
      healthy: results.filter(r => r.listening && r.responding && r.healthy).length,
      issues: results.filter(r => !r.listening || !r.responding || !r.healthy).length
    }
  };
}

// Run validation if called directly
if (require.main === module) {
  validateAllServices()
    .then(validation => {
      console.log(`\n🎯 Overall Status: ${validation.allHealthy ? 'All services healthy' : 'Issues detected'}`);
      process.exit(validation.allHealthy ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validateAllServices, validateService, SERVICES };