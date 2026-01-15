# 🔐 Unified Environment Configuration

## ✅ Setup Complete!

Your Olakz Logistics Platform backend now uses a **single unified `.env` file** containing all environment variables for all services.

---

## 📋 What's Been Set Up

### ✓ Files Created

1. **`.env`** - Main configuration file (development) ✅
2. **`.env.production.template`** - Template for production deployment
3. **`UNIFIED_ENV_GUIDE.md`** - Complete documentation
4. **`verify-env.js`** - Verification script
5. **`setup-env.sh`** - Automated setup script

### ✓ Configuration Status

Run the verification script to check your setup:

```bash
node verify-env.js
```

**Current Status:** ⚠️ Valid with warnings
- ✅ All required variables are set
- ⚠️ Missing: `SUPABASE_SERVICE_ROLE_KEY` (optional but recommended)
- ⚠️ Missing: Payment gateway credentials (optional)

---

## 🚀 Quick Start

### 1. Verify Configuration

```bash
# Check if everything is set up correctly
node verify-env.js
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install
```

### 3. Start Services

```bash
# Start all services in development mode
npm run dev

# Or start individual services
cd gateway && npm run dev
cd services/auth-service && npm run dev
cd services/core-logistics && npm run dev
```

### 4. Test Endpoints

```bash
# Gateway health check
curl http://localhost:3000/health

# Auth service health check
curl http://localhost:3003/health

# Core logistics health check
curl http://localhost:3004/health
```

---

## 📊 Environment Variables Overview

### 🔑 Critical Variables (Already Set)

| Variable | Value | Status |
|----------|-------|--------|
| `SUPABASE_URL` | `https://ijlrjelstivyhttufraq.supabase.co` | ✅ Set |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` | ✅ Set |
| `JWT_SECRET` | `f303d2f...` | ✅ Set |
| `DATABASE_URL` | `postgresql://...` | ✅ Set |

### ⚠️ Optional Variables (Not Set)

| Variable | Purpose | Impact |
|----------|---------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin database access | Some admin features won't work |
| `STRIPE_SECRET_KEY` | Payment processing | Payment features disabled |
| `STRIPE_WEBHOOK_SECRET` | Payment webhooks | Payment webhooks disabled |

---

## 🔧 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Gateway | 3000 | http://localhost:3000 |
| Auth Service | 3003 | http://localhost:3003 |
| Core Logistics | 3004 | http://localhost:3004 |
| Payment Service | 3002 | http://localhost:3002 |

---

## 📝 Common Tasks

### Update Environment Variables

```bash
# Edit the unified .env file
nano .env
# or
code .env

# Verify changes
node verify-env.js

# Restart services to apply changes
npm run dev
```

### Add Missing Service Role Key

1. Go to: https://app.supabase.com/project/ijlrjelstivyhttufraq/settings/api
2. Copy the `service_role` key
3. Update `.env`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
   ```
4. Restart services

### Setup Payment Gateway

```bash
# Add to .env
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## 🌍 Deployment

### For Production

1. **Copy production template:**
   ```bash
   cp .env.production.template .env.production
   ```

2. **Update production values:**
   ```bash
   # Edit .env.production
   NODE_ENV=production
   SUPABASE_SERVICE_ROLE_KEY=your_production_key
   JWT_SECRET=your_production_jwt_secret
   ALLOWED_ORIGINS=https://yourdomain.com
   AUTH_SERVICE_URL=https://auth.yourdomain.com
   # ... etc
   ```

3. **Verify production config:**
   ```bash
   NODE_ENV=production node verify-env.js
   ```

### Docker Deployment

```bash
# Build and run with docker-compose
docker-compose up -d

# All services will read from .env automatically
```

### Cloud Deployment (Render, Railway, etc.)

Upload your `.env` file or set environment variables in the platform's dashboard.

---

## 🔒 Security Checklist

- [x] `.env` file is in `.gitignore`
- [x] Sensitive keys are not committed to git
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set (recommended)
- [x] `JWT_SECRET` is strong and unique
- [x] Email credentials are configured
- [ ] Production uses different secrets
- [ ] Secrets are rotated regularly

---

## 🐛 Troubleshooting

### Services Can't Start

**Check if .env exists:**
```bash
ls -la .env
```

**Verify variables are loaded:**
```bash
node verify-env.js
```

**Check for port conflicts:**
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3003 | xargs kill -9
lsof -ti:3004 | xargs kill -9
```

### Database Connection Errors

**Verify Supabase credentials:**
```bash
# Test connection
node -e "
require('dotenv').config();
console.log('URL:', process.env.SUPABASE_URL);
console.log('Key:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');
"
```

### JWT Errors

**Ensure JWT_SECRET is set:**
```bash
grep JWT_SECRET .env
```

**Generate new secret if needed:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📚 Documentation

- **`UNIFIED_ENV_GUIDE.md`** - Complete guide with examples
- **`ENV_SETUP_GUIDE.md`** - Detailed setup instructions
- **`QUICK_ENV_REFERENCE.md`** - Quick copy-paste templates
- **`.env.checklist.md`** - Setup checklist

---

## 🎯 Next Steps

1. ✅ Environment configured
2. ⬜ Add `SUPABASE_SERVICE_ROLE_KEY` (recommended)
3. ⬜ Install dependencies: `npm install`
4. ⬜ Start services: `npm run dev`
5. ⬜ Test API endpoints
6. ⬜ Configure payment gateway (if needed)
7. ⬜ Setup production environment

---

## 📞 Need Help?

- Check `UNIFIED_ENV_GUIDE.md` for detailed documentation
- Run `node verify-env.js` to diagnose issues
- Review service logs for specific errors
- Contact your team lead for missing credentials

---

## ✨ Summary

Your backend is configured with:
- ✅ Single unified `.env` file
- ✅ All services configured
- ✅ Development credentials set
- ✅ Verification script ready
- ⚠️ Optional: Add service role key for full functionality
- ⚠️ Optional: Configure payment gateway when ready

**You're ready to start developing! 🚀**

```bash
# Start all services
npm run dev
```
