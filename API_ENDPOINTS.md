# Olakz Backend API Endpoints

## Base URL
**Production**: `https://olakzride.duckdns.org`

## Service Ports (Direct Access)
- **Auth Service**: `http://olakzride.duckdns.org:4001`
- **Core Logistics**: `http://olakzride.duckdns.org:4002`
- **Payment Service**: `http://olakzride.duckdns.org:4003`

---

## 🔐 Auth Service Endpoints
**Base Path**: `/api/auth`

### Registration & Email Verification
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP for email verification

### Login & Token Management
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Password Reset
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### Google OAuth
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/google/verify` - Verify Google token

### User Profile (Requires Authentication)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/role` - Update user role
- `PATCH /api/users/password` - Change password

---

## 🚚 Core Logistics Service Endpoints
**Base Path**: `/api/store` and `/api/services`

### Store Management
- `GET /api/store/init` - Initialize store data (optional auth)
- `POST /api/store/select` - Select service (requires auth)
- `GET /api/store/context` - Get service context (requires auth)

### Services (Alternative path)
- `POST /api/services/select` - Select service (requires auth)
- `GET /api/services/context` - Get service context (requires auth)

---

## 💳 Payment Service Endpoints
**Base Path**: `/api/payment`

⚠️ **Note**: Payment service routes are not yet implemented. The service is running but has no active endpoints.

---

## 🏥 Health Check Endpoints

### Service Health Checks (Direct Access)
- `GET http://olakzride.duckdns.org:4001/health` - Auth service health
- `GET http://olakzride.duckdns.org:4002/health` - Core logistics health
- `GET http://olakzride.duckdns.org:4003/health` - Payment service health

### Health Check via Nginx
- `GET https://olakzride.duckdns.org/health` - Core logistics health (proxied)

---

## 🧪 Testing Commands

### Test Direct Service Access
```bash
# Auth Service
curl http://olakzride.duckdns.org:4001/health
curl http://olakzride.duckdns.org:4001/

# Core Logistics
curl http://olakzride.duckdns.org:4002/health
curl http://olakzride.duckdns.org:4002/

# Payment Service
curl http://olakzride.duckdns.org:4003/health
curl http://olakzride.duckdns.org:4003/
```

### Test via Nginx Proxy (when configured)
```bash
# Health checks
curl http://olakzride.duckdns.org/health

# Auth endpoints
curl http://olakzride.duckdns.org/api/auth/
curl -X POST http://olakzride.duckdns.org/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Store endpoints
curl http://olakzride.duckdns.org/api/store/init
```

### Test with Authentication
```bash
# 1. First login to get token
curl -X POST http://olakzride.duckdns.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Use the returned access_token in subsequent requests
curl -X GET http://olakzride.duckdns.org/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

curl -X GET http://olakzride.duckdns.org/api/store/context \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📝 Request/Response Examples

### Register User
```bash
curl -X POST http://olakzride.duckdns.org/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login User
```bash
curl -X POST http://olakzride.duckdns.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### Get Store Init Data
```bash
curl -X GET http://olakzride.duckdns.org/api/store/init \
  -H "Content-Type: application/json"
```

---

## 🔧 Service Status

✅ **Auth Service** - Fully functional with all endpoints
✅ **Core Logistics** - Functional with store and service endpoints
⚠️ **Payment Service** - Running but no endpoints implemented yet

## 🚀 Frontend Integration

Your frontend (`mobilev2/lib/config.ts`) is already configured to use these endpoints:

```typescript
BASE_URL: 'https://olakzride.duckdns.org'
ENDPOINTS: {
  SIGNUP_REQUEST: '/api/auth/register',
  SIGNIN: '/api/auth/login',
  STORE_INIT: '/api/store/init',
  // ... other endpoints
}
```

The frontend should work seamlessly once the nginx reverse proxy is configured and the services are running.