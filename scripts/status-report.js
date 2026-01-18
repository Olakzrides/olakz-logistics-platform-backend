#!/usr/bin/env node

const { validateAllServices } = require('./validate-services');
const { testEndpoint, ENDPOINTS } = require('./test-endpoints');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuration
const REPORT_CONFIG = {
  services: [
    { name: 'auth-service', port: 4001, pm2Name: 'auth-service' },
    { name: 'core-logistics', port: 4002, pm2Name: 'core-logistics' }
  ],
  nginx: {
    configPath: '/etc/nginx/nginx.conf',
    serviceName: 'nginx'
  }
};

// Utility functions
async function getSystemInfo() {
  try {
    const [uptime, loadavg, memory] = await Promise.all([
      execAsync('uptime').catch(() => ({ stdout: 'N/A' })),
      execAsync('cat /proc/loadavg').catch(() => ({ stdout: 'N/A' })),
      execAsync('free -h').catch(() => ({ stdout: 'N/A' }))
    ]);

    return {
      uptime: uptime.stdout.trim(),
      loadavg: loadavg.stdout.trim(),
      memory: memory.stdout.trim()
    };
  } catch (error) {
    return {
      uptime: 'N/A',
      loadavg: 'N/A',
      memory: 'N/A'
    };
  }
}

async function getNginxStatus() {
  try {
    const [status, configTest] = await Promise.all([
      execAsync('sudo systemctl is-active nginx').catch(() => ({ stdout: 'unknown' })),
      execAsync('sudo nginx -t').catch(() => ({ stdout: '', stderr: 'Config test failed' }))
    ]);

    return {
      active: status.stdout.trim() === 'active',
      configValid: !configTest.stderr.includes('failed'),
      configTest: configTest.stderr || 'Configuration OK'
    };
  } catch (error) {
    return {
      active: false,
      configValid: false,
      configTest: error.message
    };
  }
}

async function getPM2Status() {
  try {
    const { stdout } = await execAsync('pm2 jlist');
    const processes = JSON.parse(stdout);
    
    return processes.map(proc => ({
      name: proc.name,
      status: proc.pm2_env.status,
      pid: proc.pid,
      uptime: proc.pm2_env.pm_uptime,
      restarts: proc.pm2_env.restart_time,
      memory: proc.monit.memory,
      cpu: proc.monit.cpu
    }));
  } catch (error) {
    return [];
  }
}

async function testEndpointConnectivity() {
  const results = {
    direct: [],
    nginx: []
  };

  // Test direct service access
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint, 'http://localhost', endpoint.port);
    results.direct.push(result);
  }

  // Test nginx-proxied access (skip health checks)
  for (const endpoint of ENDPOINTS) {
    if (endpoint.path === '/health') continue;
    
    const result = await testEndpoint(endpoint, 'https://olakzride.duckdns.org');
    results.nginx.push(result);
  }

  return results;
}

async function generateReport() {
  console.log('📊 Generating comprehensive service status report...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    system: {},
    nginx: {},
    services: {},
    endpoints: {},
    summary: {}
  };

  // System information
  console.log('🖥️  Collecting system information...');
  report.system = await getSystemInfo();

  // Nginx status
  console.log('🌐 Checking nginx status...');
  report.nginx = await getNginxStatus();

  // PM2 processes
  console.log('⚙️  Checking PM2 processes...');
  const pm2Processes = await getPM2Status();
  
  // Service validation
  console.log('🔍 Validating services...');
  const serviceValidation = await validateAllServices();
  report.services = {
    validation: serviceValidation,
    pm2: pm2Processes
  };

  // Endpoint connectivity
  console.log('🔗 Testing endpoint connectivity...');
  report.endpoints = await testEndpointConnectivity();

  // Generate summary
  const totalEndpoints = report.endpoints.direct.length + report.endpoints.nginx.length;
  const successfulEndpoints = [
    ...report.endpoints.direct.filter(e => e.success),
    ...report.endpoints.nginx.filter(e => e.success)
  ].length;

  report.summary = {
    overallHealth: serviceValidation.allHealthy && report.nginx.active,
    servicesHealthy: serviceValidation.summary.healthy,
    servicesTotal: serviceValidation.summary.total,
    endpointsWorking: successfulEndpoints,
    endpointsTotal: totalEndpoints,
    nginxActive: report.nginx.active,
    nginxConfigValid: report.nginx.configValid
  };

  return report;
}

function printReport(report) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE SERVICE STATUS REPORT');
  console.log('='.repeat(80));
  
  // Header
  console.log(`Generated: ${report.timestamp}`);
  console.log(`Overall Health: ${report.summary.overallHealth ? '✅ HEALTHY' : '❌ ISSUES DETECTED'}`);
  console.log();

  // System Information
  console.log('🖥️  SYSTEM INFORMATION');
  console.log('-'.repeat(40));
  console.log(`Uptime: ${report.system.uptime}`);
  console.log(`Load Average: ${report.system.loadavg}`);
  console.log();

  // Nginx Status
  console.log('🌐 NGINX STATUS');
  console.log('-'.repeat(40));
  console.log(`Service Active: ${report.nginx.active ? '✅ Yes' : '❌ No'}`);
  console.log(`Config Valid: ${report.nginx.configValid ? '✅ Yes' : '❌ No'}`);
  if (!report.nginx.configValid) {
    console.log(`Config Test: ${report.nginx.configTest}`);
  }
  console.log();

  // Services Status
  console.log('⚙️  SERVICES STATUS');
  console.log('-'.repeat(40));
  console.log(`Healthy Services: ${report.services.validation.summary.healthy}/${report.services.validation.summary.total}`);
  
  report.services.validation.results.forEach(service => {
    const status = (service.listening && service.responding && service.healthy) ? '✅' : '❌';
    console.log(`${status} ${service.name}:`);
    console.log(`   Port ${service.port}: ${service.listening ? 'Listening' : 'Not listening'}`);
    console.log(`   Health: ${service.healthy ? 'Healthy' : 'Unhealthy'}`);
    
    if (service.issues.length > 0) {
      service.issues.forEach(issue => console.log(`   Issue: ${issue}`));
    }
  });

  // PM2 Processes
  if (report.services.pm2.length > 0) {
    console.log('\n📋 PM2 PROCESSES');
    console.log('-'.repeat(40));
    report.services.pm2.forEach(proc => {
      const status = proc.status === 'online' ? '✅' : '❌';
      console.log(`${status} ${proc.name}: ${proc.status} (PID: ${proc.pid || 'N/A'})`);
      console.log(`   Restarts: ${proc.restarts}, Memory: ${Math.round(proc.memory / 1024 / 1024)}MB, CPU: ${proc.cpu}%`);
    });
  }

  // Endpoint Connectivity
  console.log('\n🔗 ENDPOINT CONNECTIVITY');
  console.log('-'.repeat(40));
  console.log(`Working Endpoints: ${report.summary.endpointsWorking}/${report.summary.endpointsTotal}`);
  
  console.log('\nDirect Service Access:');
  report.endpoints.direct.forEach(endpoint => {
    const status = endpoint.success ? '✅' : '❌';
    console.log(`${status} ${endpoint.method} ${endpoint.endpoint} - ${endpoint.message}`);
  });

  console.log('\nNginx-Proxied Access:');
  report.endpoints.nginx.forEach(endpoint => {
    const status = endpoint.success ? '✅' : '❌';
    console.log(`${status} ${endpoint.method} ${endpoint.endpoint} - ${endpoint.message}`);
  });

  // Recommendations
  if (!report.summary.overallHealth) {
    console.log('\n🔧 RECOMMENDATIONS');
    console.log('-'.repeat(40));
    
    if (!report.nginx.active) {
      console.log('- Start nginx service: sudo systemctl start nginx');
    }
    
    if (!report.nginx.configValid) {
      console.log('- Fix nginx configuration errors');
      console.log('- Test config: sudo nginx -t');
    }
    
    report.services.validation.results.forEach(service => {
      if (!service.listening) {
        console.log(`- Start ${service.name}: pm2 start ${service.name}`);
      } else if (!service.healthy) {
        console.log(`- Check ${service.name} logs: pm2 logs ${service.name}`);
        console.log(`- Verify ${service.name} dependencies and configuration`);
      }
    });

    const failedEndpoints = [
      ...report.endpoints.direct.filter(e => !e.success),
      ...report.endpoints.nginx.filter(e => !e.success)
    ];
    
    if (failedEndpoints.length > 0) {
      console.log('- Fix endpoint connectivity issues listed above');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 END OF REPORT');
  console.log('='.repeat(80));
}

// Main function
async function main() {
  try {
    const report = await generateReport();
    printReport(report);
    
    // Exit with appropriate code
    process.exit(report.summary.overallHealth ? 0 : 1);
  } catch (error) {
    console.error('❌ Failed to generate status report:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateReport, printReport };