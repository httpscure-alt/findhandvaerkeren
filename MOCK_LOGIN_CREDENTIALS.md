# 🔑 Mock Login Credentials Guide

## Current Status: Mock Mode Active

Since the database is not connected, the app is running in **mock mode**. This means:

✅ **Any email and password will work** (as long as email format is valid)  
✅ No real authentication required  
✅ Data is stored in browser localStorage  
✅ Perfect for testing and development

## How to Login

### Option 1: Use Any Valid Email Format

**For Consumer Account:**
- **Email:** `consumer@test.com` (or any email)
- **Password:** `password123` (or anything)

**For Partner Account:**
- **Email:** `partner@test.com` (or any email containing "partner")
- **Password:** `password123` (or anything)

**For Admin Account:**
- **Email:** `admin@test.com` (or any email containing "admin")
- **Password:** `password123` (or anything)

### Option 2: Register First (Recommended)

1. Click "Sign Up" or "Register"
2. Enter any valid email (e.g., `test@example.com`)
3. Enter any password (at least 6 characters, e.g., `test123`)
4. Choose your role (Consumer or Partner)
5. Click Register
6. You'll be automatically logged in!

## Email Format Requirements

The email must be in valid format:
- ✅ `user@example.com`
- ✅ `test@test.com`
- ✅ `partner@company.com`
- ❌ `invalid-email` (missing @)
- ❌ `test@` (incomplete)
- ❌ `@test.com` (missing username)

## Role Detection (Mock Mode)

The role is automatically determined by the email:
- Email contains **"admin"** → ADMIN role
- Email contains **"partner"** → PARTNER role
- Otherwise → CONSUMER role

Examples:
- `admin@test.com` → ADMIN
- `partner@test.com` → PARTNER
- `user@test.com` → CONSUMER
- `myadmin@company.com` → ADMIN (contains "admin")
- `businesspartner@test.com` → PARTNER (contains "partner")

## Quick Test Credentials

### Consumer
```
Email: consumer@test.com
Password: test123
```

### Partner
```
Email: partner@test.com
Password: test123
```

### Admin
```
Email: admin@test.com
Password: test123
```

## Troubleshooting

### "Please enter a valid email address"
- Make sure email has `@` symbol
- Make sure email has domain (e.g., `.com`)
- Example: `test@example.com` ✅

### "Password must be at least 6 characters"
- Use at least 6 characters
- Example: `test123` ✅

### Still Having Issues?

1. **Clear browser localStorage:**
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Clear Local Storage
   - Refresh page

2. **Try registering instead:**
   - Registration works the same way
   - Any valid email + password will work

3. **Check browser console:**
   - Open DevTools (F12)
   - Check Console tab for errors

## Important Notes

⚠️ **Mock Mode Limitations:**
- Data resets when you refresh the page (if not saved to localStorage)
- No persistent database storage
- Perfect for UI testing and development

✅ **When Database is Connected:**
- You'll need to register with real credentials
- Passwords will be validated
- Data will persist in database

---

**Bottom Line:** In mock mode, use **any valid email format** and **any password (6+ characters)** to login! 🚀






