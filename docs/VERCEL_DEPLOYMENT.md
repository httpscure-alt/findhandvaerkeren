# Deploying Frontend to Vercel

## 📦 What to Push to GitHub

**Push the ENTIRE repository** (root folder) to GitHub. Vercel will automatically detect and build only the frontend.

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Ensure `.gitignore` is correct** (already done):
   - `node_modules/` is ignored ✅
   - `dist/` is ignored ✅
   - `.env.local` should be ignored (add if not present)

2. **Add `.env.local` to `.gitignore`** (if not already):
   ```bash
   echo ".env.local" >> .gitignore
   ```

### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Frontend ready for Vercel"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project
5. **Configure these settings:**

   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

6. **Environment Variables** (if needed):
   - `VITE_API_URL` - Your backend API URL (e.g., `https://your-backend.railway.app/api`)
   - `VITE_GEMINI_API_KEY` - Your Gemini API key (optional, for AI search)

7. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? findhandvaerkeren (or your choice)
# - Directory? ./
# - Override settings? No
```

---

## ⚙️ Vercel Configuration

### Recommended Settings

**Build & Development Settings:**
- **Framework Preset:** Vite
- **Root Directory:** `./` (root of repo)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

**Environment Variables:**
```
VITE_API_URL=https://your-backend-url.railway.app/api
VITE_GEMINI_API_KEY=your-gemini-key (optional)
```

**Ignore Build Step:** Leave empty (or add custom check if needed)

---

## 📁 What Gets Deployed

Vercel will:
- ✅ Build the frontend (root folder)
- ✅ Ignore `backend/` folder (not needed for frontend build)
- ✅ Use `dist/` as output
- ✅ Serve static files from `dist/`

### Files Included:
- ✅ All `components/` folder
- ✅ All `services/` folder
- ✅ All `contexts/` folder
- ✅ `App.tsx`, `index.tsx`, `types.ts`
- ✅ `vite.config.ts`
- ✅ `package.json`
- ✅ `index.html`
- ✅ `index.css`
- ✅ All other frontend files

### Files NOT Needed (but won't hurt):
- `backend/` folder (ignored by Vercel build)
- `docs/` folder (documentation, not needed for build)
- `.env.local` (should be in Vercel env vars instead)

---

## 🔧 Post-Deployment Configuration

### 1. Update API URL

After deployment, update your environment variable:
```
VITE_API_URL=https://your-production-backend-url/api
```

### 2. Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Test all pages
3. Test navigation
4. Test API calls (if backend is deployed)

### 3. Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Solution: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Build command failed"**
- Check Vercel build logs
- Ensure `npm run build` works locally first

### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Redeploy after adding env vars
- Check Vercel dashboard → Settings → Environment Variables

### Backend Connection Issues

- Ensure `VITE_API_URL` is set correctly
- Check CORS settings on backend
- Verify backend is deployed and accessible

---

## 📝 Quick Checklist

Before deploying:
- [ ] `.gitignore` includes `.env.local`
- [ ] `package.json` has correct build script
- [ ] All dependencies are listed in `package.json`
- [ ] `vite.config.ts` is correct
- [ ] No hardcoded API URLs (use env vars)
- [ ] Test `npm run build` locally first

After deploying:
- [ ] Set environment variables in Vercel
- [ ] Test all pages work
- [ ] Test navigation works
- [ ] Test API calls (if backend connected)
- [ ] Check mobile responsiveness

---

## 🎯 Alternative: Deploy Only Frontend Folder

If you prefer to deploy ONLY the frontend (without backend folder):

### Option 1: Create Frontend-Only Branch
```bash
# Create a new branch with only frontend
git checkout -b frontend-only
git rm -r backend/
git commit -m "Remove backend for Vercel deployment"
git push origin frontend-only

# Deploy this branch to Vercel
```

### Option 2: Use Vercel's Root Directory Setting
- In Vercel settings, set **Root Directory** to `./` (already root)
- Vercel will ignore `backend/` during build anyway

**Recommendation:** Keep the full repo. Vercel ignores what it doesn't need.

---

## ✅ Summary

**What to push:** Entire repository (root folder)  
**What Vercel uses:** Frontend files only (auto-detected)  
**Build command:** `npm run build`  
**Output:** `dist/` folder  
**Environment:** Set `VITE_API_URL` and `VITE_GEMINI_API_KEY` in Vercel dashboard

**You're ready to deploy!** 🚀
