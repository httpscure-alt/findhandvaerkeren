# Findhåndværkeren - AI-Powered B2B/B2C Marketplace

A complete marketplace platform for discovering, comparing, and connecting with verified companies. Built with React, TypeScript, Node.js, Express, Prisma, and PostgreSQL.

## 🚀 Features

### Consumer Features
- **AI-Powered Search**: Intent-based search powered by Google Gemini
- **Company Discovery**: Browse companies by category, location, and verification status
- **Saved Listings**: Save favorite companies for quick access
- **Consumer Dashboard**: Manage saved listings and inquiries
- **Company Profiles**: Detailed company information with services, portfolio, and testimonials

### Partner Features
- **Partner Dashboard**: Manage company profile and view analytics
- **Profile Management**: Edit company information, services, and portfolio
- **Analytics**: Track profile views, clicks, leads, and search appearances
- **Verification**: Apply for verified status
- **Pricing Tiers**: Standard, Premium, and Elite plans

### Admin Features
- **Admin Dashboard**: Oversee all companies and users
- **Verification Management**: Approve/reject company verifications
- **Category & Location Management**: Manage marketplace categories and locations
- **User Management**: View and manage all users
- **Analytics**: Platform-wide analytics and insights

## 📁 Project Structure

```
findhåndværkeren/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities
│   │   └── server.ts       # Express server
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed script
│   └── package.json
├── components/             # React components
├── contexts/               # React contexts (Auth)
├── services/               # API services
├── docs/                   # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT.md
│   └── MISSING_FEATURES.md
└── package.json
```

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Google Gemini AI** for search

### Backend
- **Node.js** with Express
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon, Supabase, or local)
- npm or yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd findhåndværkeren
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/findhandvaerkeren"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

Generate Prisma client:
```bash
npm run db:generate
```

Run migrations:
```bash
npm run db:migrate
```

Seed database (optional):
```bash
npm run db:seed
```

Start backend:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ..
npm install
```

Create `.env.local` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your-gemini-api-key
```

Start frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔐 Default Credentials

After seeding the database, you can use these test accounts:

- **Admin**: `admin@findhandvaerkeren.dk` / `admin123`
- **Consumer**: `consumer@example.com` / `consumer123`
- **Partner**: `partner@nexussolutions.com` / `partner123`

## 📚 Documentation

- [API Documentation](./docs/API_DOCUMENTATION.md) - Complete API reference
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deploy to Railway & Vercel
- [Missing Features Analysis](./docs/MISSING_FEATURES.md) - Implementation details

## 🚢 Deployment

### Backend (Railway)
1. Push code to GitHub
2. Connect Railway to repository
3. Add PostgreSQL service
4. Set environment variables
5. Deploy

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

### Frontend (Vercel)
1. Connect Vercel to repository
2. Set environment variables
3. Deploy

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

## 🧪 Development

### Backend Scripts
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### Frontend Scripts
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔄 API Integration

The frontend uses the API service layer in `services/api.ts`. All API calls are centralized and handle authentication automatically.

Example:
```typescript
import { api } from './services/api';

// Get companies
const { companies } = await api.getCompanies({
  category: 'Technology',
  location: 'København',
  verifiedOnly: true
});

// Save listing (requires auth)
await api.saveListing(companyId);
```

## 🎨 UI Components

All components are in the `components/` directory:
- `Navbar` - Navigation bar
- `ListingCard` - Company listing card
- `ProfileView` - Company profile page
- `SearchBar` - AI-powered search
- `AuthModal` - Authentication modal
- `AdminDashboard` - Admin interface
- `PartnerDashboard` - Partner interface
- `ConsumerDashboard` - Consumer interface
- `PartnerProfileEditor` - Edit company profile

## 🔒 Authentication

Authentication is handled via JWT tokens stored in localStorage. The `AuthContext` provides:
- `login(email, password)` - Login user
- `register(email, password, name, role)` - Register user
- `logout()` - Logout user
- `user` - Current user object
- `isAuthenticated` - Auth status

## 📊 Database Schema

Key models:
- **User** - Consumers, Partners, Admins
- **Company** - Company listings
- **Service** - Company services
- **PortfolioItem** - Company portfolio
- **Testimonial** - Company testimonials
- **SavedListing** - Consumer saved companies
- **Inquiry** - Consumer inquiries
- **Category** - Marketplace categories
- **Location** - Marketplace locations
- **Subscription** - Company subscriptions
- **Analytics** - Analytics events

See `backend/prisma/schema.prisma` for full schema.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For issues or questions:
1. Check the [documentation](./docs/)
2. Review [API documentation](./docs/API_DOCUMENTATION.md)
3. Check deployment guide for setup issues

## 🔒 GDPR Compliance

The platform is GDPR-compliant with:
- Cookie consent banner
- Privacy policy page
- Terms of service page
- Data export functionality (`GET /api/gdpr/export-data`)
- Account deletion functionality (`DELETE /api/gdpr/delete-account`)
- Activity logging for all admin actions

## 📚 Documentation

- [API Documentation](./docs/API_DOCUMENTATION.md) - Complete API reference
- [Architecture Documentation](./docs/ARCHITECTURE.md) - System architecture overview
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deploy to Railway & Vercel
- [Production Setup](./docs/PRODUCTION_SETUP.md) - Production configuration guide
- [Phase Summaries](./docs/) - Implementation phase documentation

## 🎯 Roadmap

- [x] Payment integration (Stripe) ✅
- [x] Email notifications (structure ready) ✅
- [x] Advanced analytics ✅
- [ ] Review/rating system
- [ ] Messaging system
- [ ] Mobile app
- [x] Multi-language support (Danish/English) ✅

## 🚀 Recent Updates

### Phase 11 (Final)
- ✅ Security Verification & Audit
- ✅ Performance Optimizations (Chunk Splitting)
- ✅ Code Quality Cleanup
- ✅ Final Documentation Review

### Phase 10
- ✅ CI/CD Pipeline (GitHub Actions)
- ✅ Standardized Environment Configuration
- ✅ Deployment Guide

### Phase 9
- ✅ Monitoring & Logging (Sentry + Winston)
- ✅ Health Checks

### Phase 8
- ✅ Testing Infrastructure (Vitest)
- ✅ Unit & Integration Tests

### Phase 7
- ✅ File Upload System

### Phase 6
- ✅ GDPR compliance (cookie consent, privacy/terms, data export/deletion)

---

Built with ❤️ for the Danish marketplace
```
