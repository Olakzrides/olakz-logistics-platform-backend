#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Configuration
const DIRECT_BASE_URL = 'http://localhost';
const NGINX_BASE_URL = 'https://olakzride.duckdns.org';
const AUTH_PORT = 4001;
const CORE_PORT = 4002;

// Test endpoints configuration
const ENDPOINTS = [
  // Health checks
  { path: '/health', service: 'core-logistics', port: CORE_PORT, method: 'GET' },
  { path: '/health', service: 'auth-service', port: AUTH_PORT, method: 'GET' },
  
  // Auth service endpoints
  { path: '/api/auth/register', service: 'auth-service', port: AUTH_PORT, method: 'POST', expectStatus: [400, 422] },
  { path: '/api/auth/login', service: 'auth-service', port: AUTH_PORT, method: 'POST', expectStatus: [400, 422] },
  
  // Core logistics endpoints
  { path: '/api/store/init', service: 'core-logistics', port: CORE_PORT, method: 'GET' },
  { path: '/api/services/context', service: 'core-logistics', port: CORE_PORT, method: 'GET', expectStatus: [401] },
  { path: '/api/services/select', service: 'core-logistics', port: CORE_PORT, method: 'POST', expectStatus: [400, 401, 422] },
];

// Utility function to make HTTP requests
function makeRequest(url, method = 'GET', timeout = 5000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const options = {
      method,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Endpoint-Test-Script/1.0'
      }
    };

    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url
        });
      });
    });

    req.on('error', (error) => {
      reject({ error: error.message, url });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ error: 'Request timeout', url });
    });

    req.end();
  });
}

// Test a single endpoint
async function testEndpoint(endpoint, baseUrl, port = null) {
  const url = port ? `${baseUrl}:${port}${endpoint.path}` : `${baseUrl}${endpoint.path}`;
  const expectedStatuses = endpoint.expectStatus || [200, 201];
  
  try {
    const result = await makeRequest(url, endpoint.method);
    const isExpected = expectedStatuses.includes(result.statusCode);
    
    return {
      endpoint: endpoint.path,
      service: endpoint.service,
      method: endpoint.method,
      url,
      status: result.statusCode,
      success: isExpected,
      message: isExpected ? 'OK' : `Unexpected status ${result.statusCode}, expected one of: ${expectedStatuses.join(', ')}`,
      responseTime: Date.now()
    };
  } catch (error) {
    return {
      endpoint: endpoint.path,
      service: endpoint.service,
      method: endpoint.method,
      url,
      status: null,
      success: false,
      message: error.error || 'Request failed',
      responseTime: Date.now()
    };
  }
}

// Test all endpoints
async function runTests() {
  console.log('🚀 Starting endpoint connectivity tests...\n');
  
  const results = {
    direct: [],
    nginx: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  // Test direct service access
  console.log('📡 Testing direct service access...');
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint, DIRECT_BASE_URL, endpoint.port);
    results.direct.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${endpoint.method} ${result.url} - ${result.message}`);
  }

  console.log('\n🌐 Testing nginx-proxied access...');
  // Test nginx-proxied access
  for (const endpoint of ENDPOINTS) {
    // Skip health checks for nginx (they might not be proxied)
    if (endpoint.path === '/health') continue;
    
    const result = await testEndpoint(endpoint, NGINX_BASE_URL);
    results.nginx.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${endpoint.method} ${result.url} - ${result.message}`);
  }

  // Calculate summary
  const allResults = [...results.direct, ...results.nginx];
  results.summary.total = allResults.length;
  results.summary.passed = allResults.filter(r => r.success).length;
  results.summary.failed = allResults.filter(r => !r.success).length;

  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`Total tests: ${results.summary.total}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Success rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

  // Print failed tests details
  const failedTests = allResults.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    failedTests.forEach(test => {
      console.log(`  - ${test.method} ${test.url}: ${test.message}`);
    });
  }

  // Exit with appropriate code
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint, ENDPOINTS };