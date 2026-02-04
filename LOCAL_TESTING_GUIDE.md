# Local Testing & Deployment Guide

This guide will help you set up and run the FindHåndværkeren platform locally for testing.

## 1. Prerequisites
- **Node.js**: v18 or newer
- **PostgreSQL**: Running locally or accessible via URL
- **Stripe CLI** (Optional): For testing webhooks locally
- **Terminal 1**: For the Backend
- **Terminal 2**: For the Frontend

## 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` folder with the following structure:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/findhandvaerkeren"
   JWT_SECRET="your_highly_secure_random_string_here"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   RESEND_API_KEY="re_..."
   FROM_EMAIL="onboarding@resend.dev"
   FRONTEND_URL="http://localhost:5173"
   NODE_ENV="development"
   ```

4. **Initialize Database**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 3. Frontend Setup

1. **Navigate to the root directory** (from a new terminal):
   ```bash
   cd ..
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Vite Dev Server**:
   ```bash
   npm run dev
   ```

---

## 4. Testing Credentials

Use these pre-seeded accounts to test different roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **SuperAdmin** | `superadmin@findhandvaerkeren.dk` | `superadmin123` |
| **Admin** | `admin@findhandvaerkeren.dk` | `admin123` |
| **Partner** | `partner@nexussolutions.com` | `partner123` |
| **Consumer** | `consumer@example.com` | `consumer123` |

## 5. Verification Steps

1. **Admin Login**:
   - Go to `http://localhost:5173/auth`
   - Login with SuperAdmin credentials.
   - Navigate to `/admin` to see total platform stats and activity.

2. **Partner Management**:
   - Login as Partner.
   - Update services or portfolio items.
   - Confirm that changes persist and the dashboard refreshes correctly.

3. **Inquiry Flow**:
   - Login as Consumer.
   - Send an inquiry to "Nexus Solutions".
   - (If Resend is configured) Check your inbox for notifications.
   - Login as Partner to view and reply to the inquiry.

## 6. Known Issues / Troubleshooting
- **API Errors**: Ensure `VITE_API_URL` is correctly set in the frontend or defaults to `http://localhost:3001/api`.
- **Database**: If `npx prisma db seed` fails, verify your `DATABASE_URL` is correct.
- **Mocks**: The frontend will automatically fallback to mocks if the backend is not reachable, but for *real* testing, ensure the backend is running.
