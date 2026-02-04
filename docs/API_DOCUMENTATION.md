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

---

## Stripe Payment Endpoints

### Create Checkout Session
```http
POST /stripe/create-checkout-session
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "billingCycle": "monthly" | "annual",
  "tier": "Standard" | "Premium" | "Elite"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### Get Session Details
```http
GET /stripe/session-details?session_id=cs_xxx
```

**Response:**
```json
{
  "session": {
    "id": "cs_xxx",
    "status": "complete",
    "paymentStatus": "paid",
    "billingCycle": "monthly",
    "amountTotal": 49.00,
    "currency": "USD"
  },
  "subscription": { ... }
}
```

### Create Billing Portal Session
```http
POST /stripe/create-portal-session
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### Webhook Handler
```http
POST /stripe/webhook
```

**Headers:** `stripe-signature: <signature>`

**Body:** Raw Stripe event JSON

Handles events:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Admin Endpoints

All admin endpoints require `ADMIN` role.

### Get Admin Stats
```http
GET /admin/stats
```

**Response:**
```json
{
  "totalCompanies": 150,
  "verifiedCompanies": 45,
  "pendingVerifications": 12,
  "totalUsers": 500,
  "totalPartners": 120,
  "totalConsumers": 380,
  "activeSubscriptions": 95,
  "monthlyRevenue": 4655.00
}
```

### Get Admin Users
```http
GET /admin/users?role=PARTNER&page=1&limit=50&search=query
```

**Query Parameters:**
- `role` (optional): CONSUMER | PARTNER | ADMIN
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search query

### Get User Details
```http
GET /admin/users/:id
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "ownedCompany": { ... },
    "savedListings": [ ... ],
    "sentInquiries": [ ... ]
  }
}
```

### Suspend User
```http
POST /admin/users/:id/suspend
```

**Body:**
```json
{
  "reason": "Violation of terms"
}
```

### Delete User
```http
DELETE /admin/users/:id
```

### Reset User Password
```http
POST /admin/users/:id/reset-password
```

**Body:**
```json
{
  "newPassword": "newpassword123"
}
```

### Reset Partner Profile
```http
POST /admin/users/:id/reset-profile
```

### Update User Role
```http
PATCH /admin/users/:id/role
```

**Body:**
```json
{
  "role": "ADMIN" | "PARTNER" | "CONSUMER"
}
```

### Get Verification Queue
```http
GET /admin/verification-queue
```

**Response:**
```json
{
  "requests": [
    {
      "id": "...",
      "companyName": "...",
      "cvrNumber": "...",
      "status": "pending",
      "permitDocuments": [...]
    }
  ]
}
```

### Approve Verification
```http
POST /admin/verification-queue/:id/approve
```

### Reject Verification
```http
POST /admin/verification-queue/:id/reject
```

**Body:**
```json
{
  "reason": "Documents incomplete"
}
```

### Get Transactions
```http
GET /admin/transactions?dateRange=month
```

**Query Parameters:**
- `dateRange` (optional): all | month | quarter | year

**Response:**
```json
{
  "transactions": [
    {
      "id": "...",
      "userOrCompany": "...",
      "amount": 49.00,
      "currency": "usd",
      "status": "paid",
      "subscriptionId": "...",
      "eventType": "payment_succeeded",
      "createdAt": "..."
    }
  ]
}
```

### Get Activity Logs
```http
GET /admin/activity-logs?action=suspend_user&targetType=User&page=1&limit=50
```

**Query Parameters:**
- `action` (optional): Filter by action type
- `targetType` (optional): Filter by target type
- `page` (optional): Page number
- `limit` (optional): Items per page

### Create Admin User (Super Admin)
```http
POST /admin/admins
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin Name",
  "firstName": "Admin",
  "lastName": "User"
}
```

---

## GDPR Endpoints

All GDPR endpoints require authentication.

### Export User Data
```http
GET /gdpr/export-data
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": {
    "user": { ... },
    "company": { ... },
    "savedListings": [ ... ],
    "inquiries": [ ... ],
    "exportedAt": "2024-01-15T10:00:00Z"
  }
}
```

### Delete User Account
```http
DELETE /gdpr/delete-account
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Account deleted successfully",
  "deletedAt": "2024-01-15T10:00:00Z"
}
```

**Note:** Cannot delete admin accounts via this endpoint.

---

## File Upload Endpoints

All upload endpoints require `PARTNER` role.

### Upload Logo
```http
POST /upload/logo
```

**Headers:** `Authorization: Bearer <token>`

**Body:** `multipart/form-data`
- `file`: Image file (JPEG, PNG, WebP)
- `type`: "logo"

**Response:**
```json
{
  "logoUrl": "/uploads/logo/filename.jpg",
  "message": "Logo uploaded successfully"
}
```

### Upload Banner
```http
POST /upload/banner
```

**Body:** `multipart/form-data`
- `file`: Image file
- `type`: "banner"

### Upload Document
```http
POST /upload/document
```

**Body:** `multipart/form-data`
- `file`: PDF or image file
- `type`: "document"

**Response:**
```json
{
  "document": {
    "id": "...",
    "fileName": "permit.pdf",
    "fileUrl": "/uploads/document/filename.pdf",
    "fileType": "pdf",
    "fileSize": 123456
  }
}
```

---

## Company Sub-Resource Endpoints

### Get Company Services
```http
GET /companies/:companyId/services
```

**Response:**
```json
{
  "services": [ ... ]
}
```

### Get Company Portfolio
```http
GET /companies/:companyId/portfolio
```

### Get Company Testimonials
```http
GET /companies/:companyId/testimonials
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

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production.

## CORS

CORS is configured to allow requests from `FRONTEND_URL` environment variable.

## Webhooks

Stripe webhooks require signature verification. Configure `STRIPE_WEBHOOK_SECRET` in environment.
