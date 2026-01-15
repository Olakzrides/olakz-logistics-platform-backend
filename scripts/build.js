#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const services = ['auth-service', 'core-logistics', 'payment-service'];

console.log('🔨 Building all services...\n');

for (const service of services) {
  const servicePath = path.join(__dirname, '..', 'services', service);
  
  if (!fs.existsSync(servicePath)) {
    console.log(`⚠️  Service ${service} not found, skipping...`);
    continue;
  }

  console.log(`📦 Building ${service}...`);
  
  try {
    execSync('npm run build', {
      cwd: servicePath,
      stdio: 'inherit',
      timeout: 120000 // 2 minute timeout per service
    });
    console.log(`✅ ${service} built successfully\n`);
  } catch (error) {
    console.error(`❌ Failed to build ${service}`);
    console.error(error.message);
    process.exit(1);
  }
}

console.log('✨ All services built successfully!');
