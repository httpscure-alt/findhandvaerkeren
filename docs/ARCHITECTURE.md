# Architecture Documentation

## System Overview

Findhåndværkeren is a full-stack B2B/B2C marketplace platform built with modern web technologies. The system follows a RESTful API architecture with a React frontend and Node.js/Express backend.

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API (AuthContext)
- **Routing**: React Router
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Uploads**: Multer
- **Payment Processing**: Stripe

## Architecture Patterns

### Frontend Architecture

```
App.tsx (Root Component)
├── AuthContext (Global Auth State)
├── Navbar (Navigation)
├── Sidebars (Role-based: Admin, Partner, Consumer)
├── Main Content (ViewState-based routing)
│   ├── Visitor Pages (Home, Listings, Profile, etc.)
│   ├── Consumer Pages (Dashboard, Saved, Inquiries, Settings)
│   ├── Partner Pages (Dashboard, Profile Editor, Services, etc.)
│   └── Admin Pages (Dashboard, Management, Analytics, etc.)
└── Footer
```

**State Management:**
- Global auth state via `AuthContext`
- Local component state with `useState`
- ViewState enum for navigation
- API service layer for data fetching

**Component Structure:**
- `components/` - Reusable UI components
- `components/pages/` - Page-level components
- `components/layout/` - Layout components (Navbar, Footer, Sidebars)
- `components/common/` - Shared components (LoadingSkeleton, ErrorState, EmptyState)

### Backend Architecture

```
server.ts (Express App)
├── Middleware
│   ├── CORS
│   ├── JSON Parser
│   ├── Authentication (JWT)
│   ├── Role-based Authorization
│   └── Error Handler
├── Routes
│   ├── /api/auth - Authentication
│   ├── /api/companies - Company CRUD
│   ├── /api/categories - Category management
│   ├── /api/locations - Location management
│   ├── /api/admin - Admin operations
│   ├── /api/stripe - Payment processing
│   ├── /api/gdpr - GDPR compliance
│   └── /api/upload - File uploads
└── Controllers
    ├── authController.ts
    ├── companyController.ts
    ├── adminController.ts
    ├── stripeController.ts
    └── gdprController.ts
```

**Database Layer:**
- Prisma ORM for type-safe database access
- Migrations for schema changes
- Seed script for initial data

## Data Flow

### Authentication Flow
1. User submits login/register form
2. Frontend calls `api.login()` or `api.register()`
3. Backend validates credentials, creates JWT
4. Frontend stores token in localStorage
5. AuthContext updates with user data
6. Protected routes check authentication

### Data Fetching Flow
1. Component mounts or state changes
2. Component calls API service method
3. API service adds JWT token to request
4. Backend validates token, processes request
5. Response returned to frontend
6. Component updates state with data
7. UI re-renders with new data

### Payment Flow
1. Partner selects plan and billing cycle
2. Frontend calls `api.createCheckoutSession()`
3. Backend creates Stripe checkout session
4. User redirected to Stripe checkout
5. After payment, Stripe webhook fires
6. Backend processes webhook, updates database
7. User redirected to success page

## Database Schema

### Core Models

**User**
- Supports multiple roles: CONSUMER, PARTNER, ADMIN
- One-to-one relationship with Company (for partners)
- One-to-many with SavedListings, Inquiries

**Company**
- Owned by a User (partner)
- Has many Services, PortfolioItems, Testimonials
- Has subscriptions, analytics, permit documents
- Verification status tracking

**Subscription**
- Linked to Company
- Tracks Stripe subscription details
- Has payment transactions and history

**PaymentTransaction**
- Records all payment events
- Linked to Subscription
- Tracks amount, currency, status, event type

**AdminActivityLog**
- Audit trail for admin actions
- Tracks all administrative operations

**PermitDocument**
- Stores uploaded verification documents
- Linked to Company

## Security

### Authentication
- JWT tokens with expiration
- Password hashing with bcryptjs
- Token stored in localStorage (consider httpOnly cookies for production)

### Authorization
- Role-based access control (RBAC)
- Middleware checks user role before allowing access
- Admin-only endpoints protected

### Data Protection
- Input validation on all endpoints
- SQL injection prevention via Prisma
- XSS protection via React's built-in escaping
- CORS configured for specific origins

### GDPR Compliance
- Data export functionality
- Account deletion with cascade
- Cookie consent banner
- Privacy policy and terms of service

## API Design

### RESTful Principles
- GET for retrieval
- POST for creation
- PUT/PATCH for updates
- DELETE for deletion

### Error Handling
- Centralized error middleware
- Custom AppError class
- Consistent error response format
- Proper HTTP status codes

### Response Format
```json
{
  "data": { ... },
  "pagination": { ... } // when applicable
}
```

## File Structure

```
findhåndværkeren/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, error handling
│   │   ├── routes/          # Route definitions
│   │   ├── utils/           # Utilities (password, validation)
│   │   └── server.ts        # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed script
│   └── package.json
├── components/               # React components
├── contexts/                # React contexts
├── services/                # API service layer
├── docs/                    # Documentation
└── package.json
```

## Deployment Architecture

### Recommended Setup

**Frontend (Vercel/Netlify)**
- Static site hosting
- Environment variables for API URL
- Automatic deployments from Git

**Backend (Railway/Render)**
- Node.js runtime
- PostgreSQL database
- Environment variables for secrets
- Health check endpoint

**Database (Neon/Supabase)**
- Managed PostgreSQL
- Automatic backups
- Connection pooling

**File Storage**
- Currently local (uploads/ directory)
- Consider S3/Cloudinary for production

**Monitoring**
- Health check endpoint: `/health`
- Error logging (consider Sentry)
- Activity logs in database

## Performance Considerations

### Frontend
- Code splitting (Vite handles automatically)
- Lazy loading for routes
- Image optimization
- API request caching (consider React Query)

### Backend
- Database indexing on frequently queried fields
- Connection pooling
- Rate limiting (to be implemented)
- Caching for static data (categories, locations)

## Scalability

### Current Limitations
- Single server instance
- Local file storage
- No caching layer
- No CDN

### Future Improvements
- Horizontal scaling with load balancer
- Cloud storage (S3/Cloudinary)
- Redis for caching
- CDN for static assets
- Database read replicas

## Development Workflow

1. **Local Development**
   - Backend: `npm run dev` (port 5000)
   - Frontend: `npm run dev` (port 3000)
   - Database: Local PostgreSQL or cloud (Neon)

2. **Database Changes**
   - Update `schema.prisma`
   - Run `npm run db:migrate`
   - Update Prisma client: `npm run db:generate`

3. **Testing**
   - Manual testing in development
   - Consider adding unit tests
   - Integration tests for critical flows

4. **Deployment**
   - Push to Git repository
   - Automatic deployment via Railway/Vercel
   - Environment variables configured in platform

## Environment Variables

### Backend
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
FROM_EMAIL=noreply@findhandvaerkeren.dk
UPLOAD_DIR=uploads
```

### Frontend
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_GEMINI_API_KEY=...
```

## Best Practices

### Code Organization
- Controllers handle business logic
- Routes define endpoints
- Middleware for cross-cutting concerns
- Services for external integrations

### Error Handling
- Use AppError class for consistent errors
- Log errors appropriately
- Return user-friendly messages
- Don't expose internal errors

### Security
- Validate all inputs
- Sanitize user data
- Use parameterized queries (Prisma handles this)
- Implement rate limiting
- Use HTTPS in production

### Performance
- Index database fields
- Optimize queries
- Use pagination for large datasets
- Implement caching where appropriate





