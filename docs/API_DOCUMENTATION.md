# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register
```http
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "CONSUMER" | "PARTNER"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Get Current User
```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": { ... }
}
```

---

## Company Endpoints

### Get Companies (Public)
```http
GET /companies?category=Technology&location=København&verifiedOnly=true&search=AI&page=1&limit=20&sortBy=rating&sortOrder=desc
```

**Query Parameters:**
- `category` (optional): Filter by category
- `location` (optional): Filter by location
- `verifiedOnly` (optional): Boolean, filter verified companies
- `search` (optional): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): asc | desc (default: desc)

**Response:**
```json
{
  "companies": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Get Company (Public)
```http
GET /companies/:id
```

**Response:**
```json
{
  "company": { ... }
}
```

### Create Company (Partner only)
```http
POST /companies
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Company Name",
  "description": "Full description",
  "shortDescription": "Short description",
  "category": "Technology",
  "location": "København",
  "contactEmail": "contact@company.com",
  "website": "company.com",
  "tags": ["Cloud", "AI"]
}
```

### Update Company
```http
PUT /companies/:id
```

**Headers:** `Authorization: Bearer <token>`

**Body:** Same as create

### Delete Company
```http
DELETE /companies/:id
```

**Headers:** `Authorization: Bearer <token>`

### Verify Company (Admin only)
```http
PATCH /companies/:id/verify
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "isVerified": true
}
```

---

## Saved Listings Endpoints (Consumer only)

### Get Saved Listings
```http
GET /saved-listings
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "savedListings": [ ... ]
}
```

### Save Listing
```http
POST /saved-listings
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "companyId": "company_id_here"
}
```

### Unsave Listing
```http
DELETE /saved-listings/:companyId
```

**Headers:** `Authorization: Bearer <token>`

---

## Inquiry Endpoints

### Get Inquiries
```http
GET /inquiries?type=sent
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` (optional): sent | received

**Response:**
```json
{
  "inquiries": [ ... ]
}
```

### Create Inquiry
```http
POST /inquiries
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "companyId": "company_id_here",
  "message": "Inquiry message"
}
```

### Update Inquiry
```http
PATCH /inquiries/:id
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "status": "RESPONDED" | "CLOSED"
}
```

---

## Category Endpoints

### Get Categories (Public)
```http
GET /categories
```

**Response:**
```json
{
  "categories": [ ... ]
}
```

### Create Category (Admin only)
```http
POST /categories
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Category Name",
  "description": "Category description"
}
```

### Update Category (Admin only)
```http
PUT /categories/:id
```

### Delete Category (Admin only)
```http
DELETE /categories/:id
```

---

## Location Endpoints

### Get Locations (Public)
```http
GET /locations
```

**Response:**
```json
{
  "locations": [ ... ]
}
```

### Create Location (Admin only)
```http
POST /locations
```

**Body:**
```json
{
  "name": "Location Name"
}
```

### Update Location (Admin only)
```http
PUT /locations/:id
```

### Delete Location (Admin only)
```http
DELETE /locations/:id
```

---

## Analytics Endpoints

### Track Event
```http
POST /analytics/track
```

**Body:**
```json
{
  "companyId": "company_id_here",
  "eventType": "PROFILE_VIEW" | "WEBSITE_CLICK" | "INQUIRY" | "SEARCH_APPEARANCE",
  "metadata": {}
}
```

### Get Company Analytics
```http
GET /analytics/company/:companyId
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "analytics": {
    "profileViews": 1245,
    "websiteClicks": 432,
    "leads": 28,
    "searchAppearances": 5600
  }
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
