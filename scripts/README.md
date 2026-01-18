# Backend API Routing Configuration Scripts

This directory contains scripts to validate, deploy, and monitor the nginx API routing configuration and backend services.

## Scripts Overview

### 1. Service Discovery Validation (`validate-services.js`)

Validates that all backend services are properly bound to network interfaces and responding to health checks.

```bash
# Run service validation
node scripts/validate-services.js
```

**What it checks:**
- Services are listening on correct ports (4001, 4002)
- Services are bound to IPv4 interfaces accessible by nginx
- Services respond to health check requests
- Services report healthy status

### 2. Endpoint Connectivity Testing (`test-endpoints.js`)

Tests all API endpoints both directly and through nginx proxy to ensure routing is working correctly.

```bash
# Run endpoint tests
node scripts/test-endpoints.js
```

**What it tests:**
- Direct service access (localhost:4001, localhost:4002)
- Nginx-proxied access (https://olakzride.duckdns.org)
- All documented API endpoints
- Expected response status codes

### 3. Deployment Validation Pipeline (`deploy-validation.js`)

Complete deployment pipeline with validation, rollback capabilities, and safety checks.

```bash
# Full deployment
node scripts/deploy-validation.js

# Build services only
node scripts/deploy-validation.js --build-only

# Skip certain steps
node scripts/deploy-validation.js --skip-build --skip-nginx

# See all options
node scripts/deploy-validation.js --help
```

**What it does:**
1. Builds all services (TypeScript compilation)
2. Backs up current nginx configuration
3. Deploys new nginx configuration with validation
4. Restarts services using PM2
5. Runs full validation suite
6. Automatic rollback on failures

### 4. Comprehensive Status Report (`status-report.js`)

Generates detailed status report of all system components.

```bash
# Generate status report
node scripts/status-report.js
```

**What it reports:**
- System information (uptime, load, memory)
- Nginx service status and configuration validity
- PM2 process status and resource usage
- Service health and connectivity
- Endpoint accessibility (direct and proxied)
- Recommendations for fixing issues

## Usage Scenarios

### Initial Setup Validation

After setting up the backend services for the first time:

```bash
# 1. Validate services are running
node scripts/validate-services.js

# 2. Test endpoint connectivity
node scripts/test-endpoints.js

# 3. Generate full status report
node scripts/status-report.js
```

### Deployment

When deploying configuration changes:

```bash
# Full deployment with validation
node scripts/deploy-validation.js
```

### Troubleshooting

When investigating issues:

```bash
# Get comprehensive status
node scripts/status-report.js

# Focus on specific areas
node scripts/validate-services.js  # Service-specific issues
node scripts/test-endpoints.js     # Endpoint connectivity issues
```

### Monitoring

For regular health checks:

```bash
# Quick service check
node scripts/validate-services.js

# Full system status
node scripts/status-report.js
```

## Configuration

### Service Configuration

Services are expected to run on:
- **auth-service**: `127.0.0.1:4001`
- **core-logistics**: `127.0.0.1:4002`

### Nginx Configuration

The nginx configuration is deployed from:
- Source: `infrastructure/nginx/nginx.conf`
- Target: `/etc/nginx/nginx.conf`

### PM2 Process Names

Expected PM2 process names:
- `auth-service`
- `core-logistics`

## Exit Codes

All scripts use standard exit codes:
- `0`: Success, all checks passed
- `1`: Failure, issues detected

This makes them suitable for use in CI/CD pipelines and monitoring systems.

## Error Handling

### Automatic Rollback

The deployment script automatically rolls back nginx configuration if:
- New configuration fails syntax validation
- Nginx fails to reload
- Post-deployment validation fails

### Graceful Degradation

Scripts handle missing dependencies gracefully:
- If PM2 is not available, services can still be validated
- If nginx is not running, other components are still checked
- Network tools fallback (lsof → netstat → ss)

## Integration

### CI/CD Pipeline

```bash
# In your deployment pipeline
./scripts/deploy-validation.js
if [ $? -eq 0 ]; then
    echo "Deployment successful"
else
    echo "Deployment failed, check logs"
    exit 1
fi
```

### Monitoring

```bash
# Add to cron for regular health checks
*/5 * * * * /path/to/scripts/validate-services.js > /dev/null || echo "Service issues detected"
```

### Health Check Endpoint

The scripts complement the service health endpoints:
- Services: `GET /health`
- External validation: These scripts

## Troubleshooting Common Issues

### Services Not Listening

```bash
# Check if services are running
pm2 list

# Check service logs
pm2 logs auth-service
pm2 logs core-logistics

# Restart services
pm2 restart auth-service core-logistics
```

### Nginx Configuration Issues

```bash
# Test nginx configuration
sudo nginx -t

# Check nginx status
sudo systemctl status nginx

# Reload nginx
sudo systemctl reload nginx
```

### Port Binding Issues

```bash
# Check what's listening on ports
sudo lsof -i :4001 -i :4002

# Check for IPv6 binding issues
ss -tlnp | grep 400
```

### Permission Issues

Scripts that modify nginx configuration require sudo access:
- `deploy-validation.js` (for nginx config deployment)
- `status-report.js` (for nginx status checks)

Make sure the user has appropriate sudo permissions for nginx operations.