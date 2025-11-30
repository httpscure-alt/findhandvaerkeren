# Backend API

Express.js backend for Findhåndværkeren marketplace.

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your database URL
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## Environment Variables

See `.env.example` for required variables.

## API Endpoints

See `/docs/API_DOCUMENTATION.md` for complete API reference.

## Database

Uses Prisma ORM with PostgreSQL.

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio

## Development

```bash
npm run dev    # Start with hot reload
npm run build  # Build for production
npm start      # Start production server
```
