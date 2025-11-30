# Activate Your Supabase Database

## 🔴 Current Issue

The database hostname cannot be resolved, which means your Supabase database is **paused** or **inactive**.

## ✅ Solution: Activate Database

### Step 1: Go to Supabase Dashboard

1. Visit: https://app.supabase.com
2. Log in to your account
3. Find your project (the one with connection string ending in `cxtahzminxrnujysbvtz`)

### Step 2: Check Project Status

Look for one of these indicators:
- **"Paused"** badge/status
- **"Inactive"** status
- **"Restore"** button
- Grayed out project card

### Step 3: Activate/Restore

1. Click on your project
2. If you see **"Restore"** or **"Resume"** button, click it
3. Wait 2-3 minutes for the database to become active
4. You should see status change to **"Active"**

### Step 4: Verify Connection String

After activation, verify your connection string:

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **"URI"** tab
4. Copy the connection string
5. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.cxtahzminxrnujysbvtz.supabase.co:5432/postgres
   ```

### Step 5: Update .env (if needed)

If the connection string format is different, update `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:Arsene2020-@db.cxtahzminxrnujysbvtz.supabase.co:5432/postgres?sslmode=require&schema=public"
```

### Step 6: Test Connection

```bash
cd backend
npm run test:connection
```

You should see:
```
✅ Successfully connected to database!
```

### Step 7: Push Schema

```bash
npm run db:push
```

### Step 8: Seed Database

```bash
npm run db:seed
```

## 🔍 Alternative: Check Connection Pooling

If direct connection (port 5432) doesn't work after activation, try the pooler:

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection pooling**
3. Copy the **Transaction** mode connection string
4. Add `&schema=public` to the end
5. Update `backend/.env`

## ⚠️ Common Issues

### Free Tier Limitations

- Free tier databases **pause after 1 week of inactivity**
- You need to manually restore them
- Consider upgrading to Pro for always-on databases

### Project Not Found

- Verify you're logged into the correct Supabase account
- Check if the project was deleted or transferred
- Verify the project ID matches your connection string

### Still Can't Connect After Activation

1. **Wait 5 minutes** - Activation can take time
2. **Check Supabase Status**: https://status.supabase.com
3. **Try connection pooler** (port 6543)
4. **Verify password** is correct in connection string
5. **Check network** - try from different network/VPN

## 📞 Need Help?

If the database is active but still can't connect:
1. Double-check the connection string format
2. Verify password is correct
3. Check Supabase status page
4. Contact Supabase support

---

**Once activated, the connection should work immediately!** 🚀
