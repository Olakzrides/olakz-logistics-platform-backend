# Olakz Backend API Endpoints - Postman Collection

Complete list of all available API endpoints for testing.

---

## 🔐 AUTH SERVICE (Port 3003)

Base URL: `http://localhost:3003`

### 1. Register User

**POST** `/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Test@1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code.",
  "data": {
    "userId": "uuid",
    "email": "john.doe@example.com"
  }
}
```

---

### 2. Verify Email

**POST** `/api/auth/verify-email`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": "uuid",
    "email": "john.doe@example.com",
    "isVerified": true
  }
}
```

---

### 3. Login

**POST** `/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Test@1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here"
    }
  }
}
```

---

### 4. Refresh Token

**POST** `/api/auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "your_refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

### 5. Forgot Password

**POST** `/api/auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset code has been sent.",
  "data": null
}
```

---

### 6. Reset Password

**POST** `/api/auth/reset-password`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "1234",
  "newPassword": "NewPass@1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

---

### 7. Google OAuth (Server-Side)

**GET** `/api/auth/google`

Opens browser for Google authentication. Redirects to callback URL after authentication.

---

### 8. Google OAuth (Client-Side/Mobile)

**POST** `/api/auth/google/verify`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "googleToken": "google_id_token_from_mobile_sdk"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

---

### 9. Get Current User

**GET** `/api/users/me`

**Headers:**
```
Authorization: Bearer your_access_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+2348012345678",
    "role": "customer",
    "isVerified": true,
    "createdAt": "2026-01-14T10:00:00Z"
  }
}
```

---

### 10. Update Profile

**PUT** `/api/users/profile`

**Headers:**
```
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+2348012345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+2348012345678"
  }
}
```

---

### 11. Update Role

**PUT** `/api/users/role`

**Headers:**
```
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "role": "rider",
  "vehicleType": "bicycle"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "role": "rider",
    "vehicleType": "bicycle"
  }
}
```

---

### 12. Change Password

**PATCH** `/api/users/password`

**Headers:**
```
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "Test@1234",
  "newPassword": "NewPass@1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

---

## 🏪 CORE LOGISTICS SERVICE (Port 3004)

Base URL: `http://localhost:3004`

### 1. Health Check

**GET** `/health`

**Headers:** None required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-14T14:32:43.250Z",
  "checks": {
    "database": "healthy",
    "services": "healthy"
  },
  "service_count": 8
}
```

---

### 2. Store Initialization (Get All Services)

**GET** `/store/init`

**Headers:**
```
Authorization: Bearer your_access_token_here (optional)
```

OR for testing without auth:
```
x-skip-auth-validation: 1
```

**Response:**
```json
{
  "success": true,
  "message": "Store data retrieved successfully",
  "data": {
    "supported_sales_channels": [
      {
        "id": "uuid",
        "name": "mobile_ride_sc",
        "description": "Olakz Ride",
        "is_active": true,
        "metadata": {
          "rank": 1,
          "icon": "mobile_ride_sc",
          "color": "#E3F2FD"
        },
        "product": []
      },
      {
        "id": "uuid",
        "name": "mobile_delivery_sc",
        "description": "Delivery Service",
        "is_active": true,
        "metadata": {
          "rank": 2,
          "icon": "mobile_delivery_sc",
          "color": "#FFF3E0"
        },
        "product": []
      }
    ],
    "ads": [
      {
        "id": "uuid",
        "name": "mobile_ride_sc",
        "description": "Get a ride anywhere",
        "metadata": {
          "adsRank": 1,
          "imageUrl": "/banners/ride-banner.png"
        }
      }
    ],
    "main_services": [...],
    "vendors": {
      "trending": { "data": [] },
      "new": { "data": [] },
      "featured": { "data": [] },
      "nearby": { "data": [] }
    }
  }
}
```

---

### 3. Select Service

**POST** `/services/select`

**Headers:**
```
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "service_channel_name": "mobile_ride_sc",
  "user_location": {
    "latitude": 6.5244,
    "longitude": 3.3792
  },
  "metadata": {
    "source": "mobile_app",
    "device": "android"
  }
}
```

**Valid service_channel_name values:**
- `mobile_ride_sc`
- `mobile_delivery_sc`
- `mobile_food_sc`
- `mobile_market_place_sc`
- `mobile_bill_sc`
- `mobile_transport_hire_sc`
- `mobile_auto_wash_sc`
- `mobile_car-dealers_sc`

**Response:**
```json
{
  "success": true,
  "message": "Service selected successfully",
  "data": {
    "session_id": "uuid",
    "service_context": {
      "service_name": "mobile_ride_sc",
      "service_description": "Olakz Ride"
    }
  }
}
```

---

### 4. Get Service Context

**GET** `/services/context`

**Headers:**
```
Authorization: Bearer your_access_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Service context retrieved successfully",
  "data": {
    "has_active_session": true,
    "session_id": "uuid",
    "service_channel": {
      "id": "uuid",
      "name": "mobile_ride_sc",
      "description": "Olakz Ride"
    },
    "session_data": {
      "service_name": "mobile_ride_sc",
      "service_description": "Olakz Ride",
      "user_location": {
        "latitude": 6.5244,
        "longitude": 3.3792
      },
      "metadata": {
        "source": "mobile_app"
      },
      "selected_at": "2026-01-14T14:34:26.924Z"
    },
    "started_at": "2026-01-14T14:34:27.338214",
    "last_activity_at": "2026-01-14T14:34:27.338214"
  }
}
```

---

## 📝 POSTMAN SETUP INSTRUCTIONS

### Environment Variables

Create a Postman environment with these variables:

```
AUTH_BASE_URL = http://localhost:3003
CORE_BASE_URL = http://localhost:3004
ACCESS_TOKEN = (will be set after login)
REFRESH_TOKEN = (will be set after login)
USER_ID = (will be set after login)
```

### Testing Flow

1. **Register a new user** → Save userId
2. **Verify email** (check logs for OTP or use test OTP)
3. **Login** → Save accessToken and refreshToken to environment
4. **Get current user** → Verify authentication works
5. **Get store init** → See all available services
6. **Select a service** → Create service session
7. **Get service context** → Verify active session

### Quick Test Commands (cURL)

```bash
# 1. Register
curl -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Test@1234"}'

# 2. Login
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'

# 3. Get Store Init (no auth)
curl http://localhost:3004/store/init \
  -H "x-skip-auth-validation: 1"

# 4. Select Service (with auth)
curl -X POST http://localhost:3004/services/select \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"service_channel_name":"mobile_ride_sc","user_location":{"latitude":6.5244,"longitude":3.3792}}'

# 5. Get Service Context
curl http://localhost:3004/services/context \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔍 Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  },
  "timestamp": "2026-01-14T14:00:00Z"
}
```

### Common Error Codes:
- `BAD_REQUEST` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource already exists
- `VALIDATION_ERROR` (422) - Validation failed
- `INTERNAL_SERVER_ERROR` (500) - Server error

---

## 📊 Test Data

### Test Accounts (if seeded):
```
Admin:
- Email: admin@olakzrides.com
- Password: Test@1234

Customer (Verified):
- Email: customer@test.com
- Password: Test@1234

Rider:
- Email: rider@test.com
- Password: Test@1234
```

### Test Locations (Lagos, Nigeria):
```json
{
  "pickup": {
    "latitude": 6.5244,
    "longitude": 3.3792,
    "address": "Victoria Island, Lagos"
  },
  "destination": {
    "latitude": 6.4281,
    "longitude": 3.4219,
    "address": "Lekki Phase 1, Lagos"
  }
}
```

---

## 🚀 Services Status

- ✅ **Auth Service** - Port 3003 - Running
- ✅ **Core Logistics Service** - Port 3004 - Running
- ⏳ **Payment Service** - Port 3005 - Not implemented yet
- ⏳ **Ride Service** - Port 3006 - Not implemented yet

---

## 📞 Support

For issues or questions:
- Check service logs in the terminal
- Verify services are running on correct ports
- Ensure database connection is active
- Contact: support@olakzrides.com
