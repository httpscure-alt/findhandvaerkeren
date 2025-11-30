# Running Frontend Locally

## 🚀 Quick Start

### Step 1: Install Dependencies (if not already done)
```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The server will start at: **http://localhost:3000**

---

## 📋 Available Commands

### Development
```bash
npm run dev
```
- Starts Vite dev server
- Hot module replacement (HMR) enabled
- Auto-reloads on file changes
- Runs on port 3000

### Build for Production
```bash
npm run build
```
- Creates optimized production build
- Output: `dist/` folder
- Ready for deployment

### Preview Production Build
```bash
npm run build
npm run preview
```
- Preview the production build locally
- Tests the optimized version

---

## 🔧 Configuration

### Port
Default port: **3000**
- Configured in `vite.config.ts`
- Change if needed: `server: { port: 3000 }`

### Environment Variables
Create `.env.local` (optional):
```
VITE_API_URL=http://localhost:4000/api
VITE_GEMINI_API_KEY=your-key-here
```

**Note:** `.env.local` is gitignored and won't be committed.

---

## 🌐 Access Your App

Once the server starts, open:
- **Local:** http://localhost:3000
- **Network:** http://[your-ip]:3000 (accessible from other devices)

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts
```

### Dependencies Missing
```bash
npm install
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ What You'll See

1. **Homepage** with new layout:
   - Hero search section (2 inputs)
   - Featured pro card (right)
   - Category sidebar (left)
   - Listings grid
   - How It Works section

2. **All pages** accessible via navigation
3. **Mock data** loads automatically
4. **Offline mode** works (no backend needed)

---

## 🎯 Next Steps

1. **Test the new homepage layout**
2. **Navigate through all menu items**
3. **Test different user roles** (use mock login buttons)
4. **Check responsive design** (mobile/desktop)

---

**Your dev server should be running now!** 🎉

Open http://localhost:3000 in your browser.
