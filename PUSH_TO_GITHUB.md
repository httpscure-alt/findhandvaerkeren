# Push to GitHub - Quick Guide

## ✅ Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name:** `findhandvaerkeren` (or your preferred name)
   - **Description:** "AI-powered B2B/B2C marketplace platform"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## ✅ Step 2: Push Your Code

After creating the repo, GitHub will show you commands. Use these:

```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/findhandvaerkeren.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## 🔐 Authentication

If you're asked for credentials:
- **Username:** Your GitHub username
- **Password:** Use a **Personal Access Token** (not your password)

### Create Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name it: "Vercel Deployment"
4. Select scopes: `repo` (full control)
5. Click "Generate token"
6. Copy the token and use it as your password

## ✅ Step 3: Verify

1. Go to your GitHub repository page
2. You should see all your files
3. Check that `.env.local` and `backend/.env` are NOT visible (they should be ignored)

## 🚀 Next: Deploy to Vercel

After pushing to GitHub:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Vite
4. Add environment variables
5. Deploy!

---

**Need help?** The commands above will push your code to GitHub!
