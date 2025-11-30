# Setup Commands

Follow these commands in order to set up and run the application.

## Prerequisites
- Node.js 18+ installed
- Supabase database configured (connection string in `backend/.env`)

---

## Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Step 2: Generate Prisma Client

```bash
npm run db:generate
```

This generates the Prisma Client based on the schema.

---

## Step 3: Run Prisma Migrations

```bash
npm run db:migrate
```

This will:
- Create a new migration
- Apply it to your Supabase database
- Set up all tables and relationships

**Note:** If you see a prompt asking for a migration name, enter: `init`

---

## Step 4: Seed the Database

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@findhandvaerkeren.dk` / `admin123`
- Consumer user: `consumer@example.com` / `consumer123`
- Partner user: `partner@nexussolutions.com` / `partner123`
- Sample categories and locations
- Sample company with services, portfolio, and testimonials

---

## Step 5: Start the Backend Server

```bash
npm run dev
```

The backend will start on **http://localhost:4000**

You should see:
```
🚀 Server running on port 4000
📡 Environment: development
```

---

## Step 6: Install Frontend Dependencies

Open a **new terminal window** and:

```bash
cd ..
npm install
```

---

## Step 7: Start the Frontend Dev Server

```bash
npm run dev
```

The frontend will start on **http://localhost:3000**

---

## Verify Connection

1. **Backend Health Check**: Visit http://localhost:4000/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Visit http://localhost:3000
   - Should load the homepage

3. **Test Login**: Use the test credentials from Step 4

---

## Troubleshooting

### Database Connection Issues

If you get connection errors:

1. Verify `backend/.env` has the correct `DATABASE_URL` with `?sslmode=require`
2. Check Supabase dashboard to ensure database is active
3. Verify network connectivity

### Prisma Migration Issues

If migrations fail:

```bash
# Reset and retry (WARNING: This deletes all data)
npm run db:push

# Or create migration manually
npx prisma migrate dev --name init
```

### Port Already in Use

If port 4000 is taken:

1. Change `PORT` in `backend/.env` to another port (e.g., 4001)
2. Update `VITE_API_URL` in `.env.local` to match
3. Restart backend

---

## Quick Start (All Commands)

```bash
# Backend
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev

# Frontend (new terminal)
cd ..
npm install
npm run dev
```

---

## Next Steps

After setup:
1. ✅ Backend running on http://localhost:4000
2. ✅ Frontend running on http://localhost:3000
3. ✅ Database seeded with test data
4. ✅ Ready to use!

Test the API:
- Health: http://localhost:4000/health
- Companies: http://localhost:4000/api/companies
- Categories: http://localhost:4000/api/categories
