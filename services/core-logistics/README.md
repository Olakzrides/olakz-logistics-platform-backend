# Core Logistics Service

Home Page API and Service Management for Olakz Logistics Platform.

## Features

✅ Store Initialization - Fetch all service channels and advertisements
✅ Service Selection Tracking - Track when users select a service
✅ Service Context Management - Maintain active service sessions
✅ Analytics Integration - Track user interactions with services
✅ Graceful Error Handling - Fallback data when database is unavailable

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Start Development Server

```bash
npm run dev
```

The service will start on port 3004.

## API Endpoints

### Store Initialization

**Get Store Data**
```http
GET /store/init
Authorization: Bearer <token> (optional)
```

Response:
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

### Service Selection

**Select a Service**
```http
POST /services/select
Authorization: Bearer <token> (required)
Content-Type: application/json

{
  "service_channel_name": "mobile_ride_sc",
  "user_location": {
    "latitude": 6.5244,
    "longitude": 3.3792
  },
  "metadata": {}
}
```

Response:
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

### Service Context

**Get Active Service Context**
```http
GET /services/context
Authorization: Bearer <token> (required)
```

Response:
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
      "selected_at": "2026-01-14T14:34:26.924Z"
    },
    "started_at": "2026-01-14T14:34:27.338214",
    "last_activity_at": "2026-01-14T14:34:27.338214"
  }
}
```

### Health Check

**Check Service Health**
```http
GET /health
```

Response:
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

## Available Service Channels

- `mobile_ride_sc` - Olakz Ride
- `mobile_delivery_sc` - Delivery Service
- `mobile_food_sc` - Olakz Foods
- `mobile_market_place_sc` - Market Place
- `mobile_bill_sc` - Airtime & Data
- `mobile_transport_hire_sc` - Transport Hire
- `mobile_auto_wash_sc` - Auto Wash
- `mobile_car-dealers_sc` - Car Dealers

## Environment Variables

See `.env.example` for all required variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Service port (default: 3004)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `ALLOWED_ORIGINS` - CORS allowed origins
- `ANALYTICS_ENABLED` - Enable/disable analytics tracking
- `CACHE_TTL` - Cache time-to-live in seconds

## Development

```bash
# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run typecheck
```

## Architecture

The service follows a clean architecture pattern:

```
src/
├── config/          # Configuration
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── repositories/    # Data access layer
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utilities
├── validators/      # Request validation
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Database Tables

The service uses the following Supabase tables:

- `service_channels` - Available service channels
- `products` - Products within service channels
- `advertisements` - Promotional banners
- `user_service_sessions` - Active user service sessions
- `service_analytics` - Service usage analytics

## Error Handling

The service implements graceful error handling with fallback data:

- If database is unavailable, returns hardcoded essential services
- All errors are logged with context
- Proper HTTP status codes for all error scenarios
- Validation errors include detailed field-level messages

## Security

- CORS configured for allowed origins
- Request validation using Joi schemas
- Authentication middleware (TODO: integrate with auth-service)
- Rate limiting ready (TODO: implement)

## Testing

```bash
# Test store init endpoint
curl http://localhost:3004/store/init -H "x-skip-auth-validation: 1"

# Test service selection
curl -X POST http://localhost:3004/services/select \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"service_channel_name":"mobile_ride_sc","user_location":{"latitude":6.5244,"longitude":3.3792}}'

# Test service context
curl http://localhost:3004/services/context \
  -H "Authorization: Bearer test-token"

# Test health check
curl http://localhost:3004/health
```

## Next Steps

- [ ] Integrate JWT validation with auth-service
- [ ] Implement rate limiting
- [ ] Add caching layer (Redis)
- [ ] Add comprehensive unit tests
- [ ] Add integration tests
- [ ] Implement service availability checks
- [ ] Add personalized service ordering
- [ ] Implement A/B testing for service presentation

## Support

For issues, contact support@olakzrides.com
