# Production Setup Guide

## Pre-Production Checklist

### Security
- [ ] All environment variables set and secure
- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] Stripe keys are production keys (not test)
- [ ] CORS configured for production domain only
- [ ] HTTPS enforced on all endpoints
- [ ] Rate limiting configured (recommended)

### Database
- [ ] Production database created
- [ ] Migrations run successfully
- [ ] Database backups enabled
- [ ] Connection pooling configured
- [ ] Indexes created for performance

### Application
- [ ] All tests passing (if applicable)
- [ ] Error handling verified
- [ ] Logging configured
- [ ] Health check endpoint working
- [ ] API documentation updated

### External Services
- [ ] Stripe webhook endpoint configured
- [ ] Stripe webhook secret set
- [ ] Email service configured (if using)
- [ ] File storage configured (S3/Cloudinary if using)

## Production Environment Variables

### Backend
```env
# Core
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=<generate-strong-secret>
FRONTEND_URL=https://yourdomain.com

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...

# Email
FROM_EMAIL=noreply@findhandvaerkeren.dk
# Add email service credentials if using SendGrid/AWS SES

# File Uploads
UPLOAD_DIR=uploads
# Or configure S3/Cloudinary

# Monitoring (Optional)
SENTRY_DSN=https://...
LOGFLARE_API_KEY=...
```

### Frontend
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_GEMINI_API_KEY=...
VITE_SENTRY_DSN=... # Optional
```

## Database Setup

### 1. Create Production Database
- Use managed PostgreSQL (Neon, Supabase, AWS RDS)
- Enable automatic backups
- Configure connection pooling

### 2. Run Migrations
```bash
cd backend
npm run db:migrate
```

### 3. Seed Initial Data (Optional)
```bash
npm run db:seed
```

### 4. Verify Database
```bash
npm run db:studio
# Or use psql to verify connection
```

## Stripe Production Setup

### 1. Switch to Live Mode
- Use live API keys from Stripe dashboard
- Update `STRIPE_SECRET_KEY` to `sk_live_...`
- Update price IDs to live price IDs

### 2. Configure Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Test Webhooks
- Use Stripe CLI for local testing
- Verify webhook signature validation
- Test all event types

## Monitoring Setup

### Health Check
The backend includes a health check endpoint:
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Error Monitoring (Sentry)

**Install:**
```bash
cd backend
npm install @sentry/node @sentry/profiling-node
```

**Configure:**
```typescript
// backend/src/utils/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  tracesSampleRate: 0.1, // 10% of transactions
  profilesSampleRate: 0.1,
});
```

**Integrate:**
```typescript
// server.ts
import Sentry from './utils/sentry';

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
// ... your routes
app.use(Sentry.Handlers.errorHandler());
```

### Logging
- Use structured logging (Pino recommended)
- Log to centralized service (Logflare, Datadog, etc.)
- Set up alerts for errors

## Performance Optimization

### Database
- Enable connection pooling
- Add indexes on frequently queried fields
- Monitor slow queries
- Use read replicas for scaling (future)

### Backend
- Enable compression middleware
- Implement caching for static data
- Use CDN for static assets
- Monitor response times

### Frontend
- Enable code splitting
- Optimize images
- Use CDN for assets
- Implement service worker (PWA)

## Security Hardening

### 1. Environment Variables
- Never commit `.env` files
- Use secure secret management
- Rotate secrets regularly
- Use different secrets for each environment

### 2. API Security
- Implement rate limiting
- Validate all inputs
- Sanitize user data
- Use HTTPS only
- Set secure headers

### 3. Database Security
- Use SSL connections
- Restrict database access
- Use strong passwords
- Enable database firewall

### 4. Authentication
- Use strong JWT secrets
- Set appropriate token expiration
- Implement refresh tokens (future)
- Add 2FA for admin accounts (future)

## Backup Strategy

### Database Backups
- **Automated**: Daily backups via Neon/Supabase
- **Manual**: Before major deployments
- **Retention**: 30 days minimum
- **Testing**: Test restore process monthly

### File Backups
- If using local storage, sync to S3/cloud
- If using S3, enable versioning
- Regular backup verification

## Domain & SSL Setup

### 1. Domain Configuration
- Purchase domain
- Configure DNS records:
  - `api.yourdomain.com` → Railway backend
  - `yourdomain.com` → Vercel frontend

### 2. SSL Certificates
- Railway: Automatic SSL via Let's Encrypt
- Vercel: Automatic SSL via Let's Encrypt
- Custom certificates: Configure in platform dashboard

### 3. DNS Records
```
Type    Name    Value
A       api     <Railway IP>
CNAME   www     <Vercel URL>
A       @       <Vercel IP>
```

## Deployment Process

### 1. Pre-Deployment
- [ ] Run tests locally
- [ ] Check for TypeScript errors
- [ ] Verify environment variables
- [ ] Test database migrations
- [ ] Review code changes

### 2. Deployment
- [ ] Push to main branch
- [ ] Monitor deployment logs
- [ ] Verify health check
- [ ] Test critical flows
- [ ] Check error monitoring

### 3. Post-Deployment
- [ ] Verify all endpoints working
- [ ] Test authentication
- [ ] Test payment flow
- [ ] Check admin functions
- [ ] Monitor error logs

## Rollback Procedure

### Backend (Railway)
1. Go to Railway dashboard
2. Navigate to deployments
3. Select previous successful deployment
4. Click "Redeploy"

### Frontend (Vercel)
1. Go to Vercel dashboard
2. Navigate to deployments
3. Select previous deployment
4. Click "Promote to Production"

### Database
1. Restore from backup if needed
2. Run migrations rollback if necessary

## Maintenance

### Regular Tasks
- **Daily**: Monitor error logs
- **Weekly**: Review performance metrics
- **Monthly**: Test backup restore
- **Quarterly**: Security audit
- **As needed**: Update dependencies

### Updates
- Keep dependencies updated
- Monitor security advisories
- Test updates in staging first
- Document breaking changes

## Support & Troubleshooting

### Common Issues

**Database Connection Errors:**
- Check DATABASE_URL format
- Verify database is accessible
- Check firewall rules
- Verify SSL mode

**CORS Errors:**
- Verify FRONTEND_URL matches actual domain
- Check CORS middleware configuration
- Ensure credentials are allowed

**Stripe Webhook Errors:**
- Verify webhook secret
- Check webhook endpoint URL
- Verify event types are selected
- Check webhook signature validation

**Performance Issues:**
- Check database query performance
- Monitor API response times
- Review error logs
- Check for memory leaks

## Production Checklist Summary

- [ ] All environment variables configured
- [ ] Database created and migrated
- [ ] Stripe production keys configured
- [ ] Webhooks configured and tested
- [ ] SSL certificates active
- [ ] Custom domain configured
- [ ] Error monitoring set up
- [ ] Database backups enabled
- [ ] Health check working
- [ ] All critical flows tested
- [ ] GDPR compliance verified
- [ ] Privacy policy and terms accessible
- [ ] Cookie consent working
- [ ] Documentation updated





