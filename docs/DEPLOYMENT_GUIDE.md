# Deployment Guide

This guide covers the deployment of the Findhåndværkeren platform to a production environment.

## Prerequisites

- **Node.js**: v20.x or higher
- **PostgreSQL**: v14.x or higher
- **Web Server**: Nginx or Apache (for reverse proxy)
- **Process Manager**: PM2 (recommended for VPS)
- **Domain Name**: Configured DNS records

## Environment Variables

Ensure you have all required environment variables set in your production environment. Refer to `.env.example` and `backend/.env.example`.

**Critical Variables:**
- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET`
- `CLOUDINARY_*`
- `STRIPE_*`
- `SENTRY_DSN`

## Option 1: VPS Deployment (Ubuntu/EC2 + PM2)

### 1. Backend Setup

1.  Clone the repository.
2.  Navigate to `backend`: `cd backend`
3.  Install dependencies: `npm ci`
4.  Build the project: `npm run build`
5.  Run migrations: `npx prisma migrate deploy`
6.  Start with PM2:
    ```bash
    pm2 start dist/server.js --name "findhandvaerkeren-api"
    ```

### 2. Frontend Setup

1.  Navigate to root: `cd ..`
2.  Install dependencies: `npm ci`
3.  Build the project: `npm run build`
4.  Serve the `dist` folder using Nginx.

### 3. Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/findhandvaerkeren/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Option 2: PaaS (Render/Railway/Heroku)

### Backend

1.  **Build Command**: `cd backend && npm install && npm run build`
2.  **Start Command**: `cd backend && node dist/server.js`
3.  **Environment Variables**: Add all keys from `backend/.env.example`.

### Frontend

1.  **Build Command**: `npm install && npm run build`
2.  **Publish Directory**: `dist`
3.  **Rewrite Rules**: Check your provider's docs for SPA rewrites (redirect all to `index.html`).

## Monitoring

- Check Sentry dashboard for errors.
- Monitor PM2 logs: `pm2 logs`.
- Monitor server resource usage.
