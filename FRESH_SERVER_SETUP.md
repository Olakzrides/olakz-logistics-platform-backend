# 🚀 Fresh Server Setup Guide

## Step 1: Clean Slate on Server

```bash
# Remove existing repo and processes
cd /home/quayyum
rm -rf olakz-logistics-platform-backend
pm2 stop all
pm2 delete all
```

## Step 2: Clone Fresh Repository

```bash
# Clone the repo
git clone https://github.com/your-username/olakz-logistics-platform-backend.git
cd olakz-logistics-platform-backend

# Switch to the correct branch
git checkout feature/home-page-service-api
```

## Step 3: Environment Configuration

**⚠️ Security Note:** Replace all placeholder values (marked with `<YOUR_...>`) with your actual credentials. Never commit real secrets to version control.

### Root .env file
```bash
cat > .env << 'EOF'
# Environment
NODE_ENV=production
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://postgres:LakzRide1234%23@db.ijlrjelstivyhttufraq.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://ijlrjelstivyhttufraq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbHJqZWxzdGl2eWh0dHVmcmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTYyNDcsImV4cCI6MjA4MzI3MjI0N30.qmb-4FMzjug9R7QI63FEHgTJfnF7mR-Ie2sZ-Fx73Cg
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# CORS
ALLOWED_ORIGINS=https://olakzride.duckdns.org,http://localhost:19006,http://localhost:19000

# Frontend URLs
FRONTEND_URL=https://olakzride.duckdns.org
MOBILE_APP_DEEP_LINK=olakzride://
EOF
```

### Auth Service .env
```bash
cat > services/auth-service/.env << 'EOF'
NODE_ENV=production
PORT=4001

# Database
DATABASE_URL=postgresql://postgres:LakzRide1234%23@db.ijlrjelstivyhttufraq.supabase.co:5432/postgres
SUPABASE_URL=https://ijlrjelstivyhttufraq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbHJqZWxzdGl2eWh0dHVmcmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTYyNDcsImV4cCI6MjA4MzI3MjI0N30.qmb-4FMzjug9R7QI63FEHgTJfnF7mR-Ie2sZ-Fx73Cg
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT
JWT_SECRET=f303d2fe996095661c7e864a7d7de2a8cadeada4893dc7a4d89b47a246947e0f129ff997736314fec091256bc3b18b9f2b7eefa8e1974fce1f455a30da76804e
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# OTP
OTP_LENGTH=4
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3
OTP_RESEND_LIMIT_PER_HOUR=3

# Email (ZeptoMail)
ZEPTO_SMTP_HOST=smtp.zeptomail.com
ZEPTO_SMTP_PORT=587
ZEPTO_SMTP_USER=emailapikey
ZEPTO_SMTP_PASS=wSsVR60j/hL3CKp+n2apJrttygwDB1n0FEx8ilLzvnKoF63L8sdvnkDOBA6kHfkcFzFrEmAR8u14zEgEgzsIjd4ozw0DWyiF9mqRe1U4J3x17qnvhDzDWW5dkxaPL4sBzwhun2hgE80g+g==
ZEPTO_FROM_EMAIL=noreply@olakzrides.com
ZEPTO_FROM_NAME=Olakz ride

# Google OAuth (Configure these with your actual values)
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

# Rate Limiting
REGISTRATION_RATE_LIMIT=5
LOGIN_RATE_LIMIT=5
LOGIN_BLOCK_DURATION_MINUTES=15

# CORS
ALLOWED_ORIGINS=https://olakzride.duckdns.org,http://localhost:19006,http://localhost:19000

# Logging
LOG_LEVEL=info

# Frontend URLs
FRONTEND_URL=https://olakzride.duckdns.org
MOBILE_APP_DEEP_LINK=olakzride://

# Security
BCRYPT_ROUNDS=10
EOF
```

### Core Logistics .env
```bash
cat > services/core-logistics/.env << 'EOF'
NODE_ENV=production
PORT=4002

# Database
DATABASE_URL=postgresql://postgres:LakzRide1234%23@db.ijlrjelstivyhttufraq.supabase.co:5432/postgres
SUPABASE_URL=https://ijlrjelstivyhttufraq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbHJqZWxzdGl2eWh0dHVmcmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTYyNDcsImV4cCI6MjA4MzI3MjI0N30.qmb-4FMzjug9R7QI63FEHgTJfnF7mR-Ie2sZ-Fx73Cg
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# CORS
ALLOWED_ORIGINS=https://olakzride.duckdns.org,http://localhost:19006,http://localhost:19000

# Logging
LOG_LEVEL=info

# Cache
CACHE_TTL=300

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_BATCH_SIZE=100

# Services
MAX_SESSIONS_PER_USER=1
SESSION_TIMEOUT=60
EOF
```

## Step 4: Install Dependencies and Build

```bash
# Install dependencies
npm install

# Build all services
npm run build

# Create logs directory
mkdir -p logs
```

## Step 5: Configure Nginx

```bash
# Copy nginx configuration
sudo cp infrastructure/nginx/nginx.conf /etc/nginx/nginx.conf

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Step 6: Start Services with PM2

```bash
# Start all services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Step 7: Verify Everything Works

```bash
# Check PM2 status
pm2 status
pm2 logs

# Test services directly
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4002/api/store/init

# Test through nginx
curl https://olakzride.duckdns.org/health
curl https://olakzride.duckdns.org/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}'
curl https://olakzride.duckdns.org/api/store/init
```

## Expected Results:

- `/health` → `{"status":"healthy",...}`
- `/api/auth/login` → `400` or `401` (validation error - this is correct!)
- `/api/store/init` → JSON response with store data

## Troubleshooting:

If services fail to start:
```bash
# Check logs
pm2 logs

# Restart services
pm2 restart all

# Check if ports are in use
ss -tlnp | grep 400
```

If nginx fails:
```bash
# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t
```

## Success Indicators:

✅ PM2 shows all services as "online"
✅ Direct service calls return proper responses
✅ Nginx-proxied calls work correctly
✅ No 502 Bad Gateway errors
✅ Mobile app can connect to APIs