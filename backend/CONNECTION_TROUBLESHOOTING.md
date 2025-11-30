# Database Connection Troubleshooting

## Current Issue

The database connection is failing with:
```
Error: P1001: Can't reach database server at `db.cxtahzminxrnujysbvtz.supabase.co:5432`
```

## Possible Causes & Solutions

### 1. Database is Paused (Most Common)

**Check in Supabase Dashboard:**
1. Go to https://app.supabase.com
2. Select your project
3. Look for "Paused" status
4. Click **"Restore"** or **"Resume"**
5. Wait 2-3 minutes for full activation

### 2. Connection Pooling Issue

Supabase offers two connection methods:

#### Option A: Direct Connection (Current)
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

#### Option B: Connection Pooler (Recommended for Prisma)
```
postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true
```

**Try the pooler connection:**
- Port: `6543` instead of `5432`
- Add: `?pgbouncer=true&sslmode=require&schema=public`

### 3. Network/Firewall Issues

**Test connectivity:**
```bash
# Test if host is reachable
ping db.cxtahzminxrnujysbvtz.supabase.co

# Test if port is open
nc -zv db.cxtahzminxrnujysbvtz.supabase.co 5432
```

**If blocked:**
- Check VPN settings
- Check firewall rules
- Try from different network

### 4. Connection String Format

**Current format (Direct):**
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?sslmode=require&schema=public
```

**Alternative format (Pooler):**
```
postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true&sslmode=require&schema=public
```

### 5. Get Fresh Connection String from Supabase

1. Go to Supabase Dashboard
2. Settings → Database
3. Connection string → Connection pooling
4. Copy the "Transaction" mode connection string
5. Add `&schema=public` to the end

## Quick Fixes to Try

### Fix 1: Use Connection Pooler

Update `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:Arsene2020-@db.cxtahzminxrnujysbvtz.supabase.co:6543/postgres?pgbouncer=true&sslmode=require&schema=public"
```

Then try:
```bash
npm run db:push
```

### Fix 2: Verify Database Status

1. Open Supabase Dashboard
2. Check project status
3. If paused → Restore
4. Wait for "Active" status

### Fix 3: Test with psql (if installed)

```bash
psql "postgresql://postgres:Arsene2020-@db.cxtahzminxrnujysbvtz.supabase.co:5432/postgres?sslmode=require"
```

If this works, the issue is with Prisma. If it doesn't, the issue is network/database.

## Recommended Solution

**Try the connection pooler first** (port 6543):

1. Update `.env` with pooler connection string
2. Run `npm run db:push`
3. If still fails, check Supabase dashboard for database status

## Still Not Working?

1. **Check Supabase Status Page**: https://status.supabase.com
2. **Verify Project**: Make sure you're using the correct project
3. **Check Billing**: Free tier databases pause after inactivity
4. **Contact Support**: If database is active but still can't connect

---

**Note**: The schema fix (`schema=public`) is already applied and working correctly. The issue is purely connectivity.
