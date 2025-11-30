# How to Access Super Admin Dashboard

## Quick Access Guide

### Step 1: Log in as Admin
To access the Super Admin Dashboard, you need to be logged in with the `ADMIN` role.

**In Offline/Mock Mode:**
- Use an email that contains "admin" (e.g., `admin@test.com`, `superadmin@test.com`)
- Any password will work in mock mode
- The system automatically assigns `ADMIN` role if email contains "admin"

**Example Login:**
- Email: `admin@test.com`
- Password: `password123`

### Step 2: Access Super Admin Dashboard

**Option A: From Top Navigation Bar**
1. After logging in as admin, look at the top navigation bar
2. You should see "Super Admin" link (purple/highlighted)
3. Click it to access the Super Admin Dashboard

**Option B: From Admin Sidebar**
1. Click "Dashboard" in the navbar (goes to regular Admin Dashboard)
2. In the left sidebar, click "Super Admin" (first item, highlighted with gradient)
3. The Super Admin Dashboard will open

**Option C: From User Dropdown**
1. Click your profile icon in the top right
2. In the dropdown menu, click "Super Admin" (purple/highlighted)
3. The Super Admin Dashboard will open

### Step 3: Verify You're Logged In as Admin

If you don't see the "Super Admin" link:
1. Check your browser console (F12) for any errors
2. Verify your user role in localStorage:
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Check `localStorage` → `user`
   - The `role` field should be `"ADMIN"`

### Troubleshooting

**If Super Admin link doesn't appear:**
1. Make sure you're logged in with an email containing "admin"
2. Clear localStorage and log in again
3. Check browser console for errors
4. Verify the import in `App.tsx` includes `SuperAdminDashboard`

**To manually set admin role (for testing):**
```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem('user'));
user.role = 'ADMIN';
localStorage.setItem('user', JSON.stringify(user));
// Then refresh the page
```

### Direct URL Access (if using routing)
If you have URL routing enabled, you can try:
- `/super-admin`
- `/admin/super`

But currently the app uses ViewState routing, so navigation through the UI is required.
