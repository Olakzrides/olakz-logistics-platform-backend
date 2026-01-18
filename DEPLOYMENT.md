# Olakz Backend Deployment Guide

This guide provides step-by-step instructions for deploying the Olakz backend services.

## Quick Start

### Automated Deployment

The easiest way to deploy is using the automated deployment script:

```bash
# Make scripts executable
chmod +x scripts/deploy.sh scripts/validate.sh

# Run deployment
./scripts/deploy.sh
```

### Manual Deployment

If you prefer manual deployment or need to troubleshoot:

```bash
# 1. Install dependencies
npm install

# 2. Build all services
npm run build

# 3. Start services
pm2 start ecosystem.config.js

# 4. Validate deployment
./scripts/validate.sh
```

## Prerequisites

- Node.js (v18 or higher)
- PM2 process manager: `npm install -g pm2`
- Nginx (for reverse proxy)
- curl (for testing)

## Services

The backend consists of three microservices:

- **auth-service** (Port 4001): Authentication and user management
- **core-logistics** (Port 4002): Main business logic, store, and services
- **payment-service** (Port 4003): Payment processing

## Configuration

### Environment Variables

Each service has its own `.env` file:

- `services/auth-service/.env`
- `services/core-logistics/.env`
- `services/payment-service/.env`

### PM2 Configuration

Services are managed by PM2 using `ecosystem.config.js`. This file defines:

- Service names and script paths
- Port configurations
- Log file locations
- Restart policies

### Nginx Configuration

The nginx configuration is located at `infrastructure/nginx/nginx.conf` and includes:

- Reverse proxy rules for all services
- Rate limiting
- Security headers
- Error handling

## API Endpoints

### Health Checks

- `GET /health` - Overall system health (proxied to core-logistics)
- `GET http://localhost:4001/health` - Auth service health (direct)
- `GET http://localhost:4002/health` - Core logistics health (direct)

### Authentication Service (Port 4001)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/google` - Google OAuth
- `GET /api/users/me` - Get user profile (requires auth)

### Core Logistics Service (Port 4002)

- `GET /api/store/init` - Initialize store data
- `POST /api/services/select` - Select a service
- `GET /api/services/context` - Get service context

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Services not running: `pm2 restart all`
   - Services not built: `npm run build && pm2 restart all`
   - IPv6 binding issue: Services should bind to `0.0.0.0` (already configured)

2. **404 Not Found**
   - Route mounting issue: Check service code for correct route paths
   - Nginx configuration: Verify proxy rules match service routes

3. **Service Won't Start**
   - Check logs: `pm2 logs [service-name]`
   - Check environment variables in `.env` files
   - Verify dependencies: `npm install`

### Validation Script

Use the validation script to diagnose issues:

```bash
./scripts/validate.sh
```

This script checks:
- PM2 service status
- Port availability and binding
- Direct service endpoints
- Nginx proxy endpoints

### Manual Testing

Test services directly:

```bash
# Test auth service
curl http://localhost:4001/health
curl http://localhost:4001/api/auth/login

# Test core logistics
curl http://localhost:4002/health
curl http://localhost:4002/api/store/init
curl http://localhost:4002/api/services/context
```

Test through nginx:

```bash
# Replace with your domain
curl https://olakzride.duckdns.org/health
curl https://olakzride.duckdns.org/api/auth/login
curl https://olakzride.duckdns.org/api/store/init
```

### Logs

View service logs:

```bash
# All services
pm2 logs

# Specific service
pm2 logs auth-service
pm2 logs core-logistics

# Follow logs in real-time
pm2 logs --follow
```

## Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Services built (`npm run build`)
- [ ] Environment variables configured
- [ ] PM2 services started (`pm2 start ecosystem.config.js`)
- [ ] Services healthy (check `pm2 status`)
- [ ] Direct endpoints accessible
- [ ] Nginx configuration updated
- [ ] Nginx reloaded (`sudo systemctl reload nginx`)
- [ ] Proxy endpoints accessible
- [ ] Validation script passes (`./scripts/validate.sh`)

## Production Considerations

### Security

- Use HTTPS in production (configure SSL in nginx)
- Set strong JWT secrets in environment variables
- Configure proper CORS origins
- Use environment-specific database credentials

### Monitoring

- Set up log rotation for PM2 logs
- Monitor service health endpoints
- Set up alerts for service failures
- Monitor resource usage (CPU, memory)

### Backup

- Backup database regularly
- Version control environment configurations
- Document deployment procedures
- Test disaster recovery procedures

## Support

If you encounter issues:

1. Run the validation script: `./scripts/validate.sh`
2. Check service logs: `pm2 logs`
3. Verify configuration files
4. Check network connectivity between services
5. Ensure all environment variables are set correctly