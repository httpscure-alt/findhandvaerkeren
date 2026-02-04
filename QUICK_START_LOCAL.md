# 🚀 Quick Start - View Your App Locally

## Simple 2-Step Start (Easiest Way)

### Step 1: Start Backend Server

Open **Terminal 1** and run:

```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren/backend
npm run dev
```

**Wait for:** `🚀 Server running on port 4000`

### Step 2: Start Frontend Server

Open **Terminal 2** (keep Terminal 1 running) and run:

```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren
npm run dev
```

**Wait for:** `➜  Local:   http://localhost:3000/`

---

## 🌐 Access Your Application

Once both servers are running:

1. **Open your browser**
2. **Go to:** http://localhost:3000
3. **You should see:** The Findhåndværkeren homepage

---

## ✅ What You'll See

- **Homepage** with search functionality
- **Company listings** (mock data if database not connected)
- **Navigation menu** with all pages
- **Login/Signup** buttons
- **All features** working in mock mode

---

## 🔧 If Something Doesn't Work

### Backend won't start?

**Check if port 4000 is in use:**
```bash
lsof -i :4000
```

**If port is busy, kill it:**
```bash
lsof -ti:4000 | xargs kill -9
```

**Or install dependencies:**
```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren/backend
npm install
```

### Frontend won't start?

**Check if port 3000 is in use:**
```bash
lsof -i :3000
```

**If port is busy, kill it:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Or install dependencies:**
```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren
npm install
```

### Database Connection Error?

**Don't worry!** The app will automatically use **mock mode**:
- ✅ All features work
- ✅ No database needed
- ✅ Perfect for viewing the UI
- ⚠️ Data resets on server restart

---

## 📍 URLs

- **Frontend (Main App):** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Health Check:** http://localhost:4000/health

---

## 🎯 What to Test

1. **Browse the homepage** - See the hero section and listings
2. **Click "Log In"** - Test authentication modal
3. **Navigate menu items** - Categories, How It Works, About, etc.
4. **View company profiles** - Click on any company card
5. **Test search** - Use the search bar
6. **Check different pages** - All visitor pages are accessible

---

## 💡 Tips

- **Keep both terminals open** - Backend and frontend need to run simultaneously
- **Hot reload enabled** - Changes to code will auto-refresh in browser
- **Mock mode is fine** - Perfect for viewing and testing the UI
- **No database needed** - App works without database connection

---

**That's it! You're ready to explore your application! 🎉**

