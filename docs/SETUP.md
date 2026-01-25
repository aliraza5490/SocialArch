# SocialArch - Setup & Environment Configuration

## Environment Variables Setup

Before running the application, you need to set up environment variables. Copy the `.env.example` file and customize it:

```bash
cp .env.example .env.local
```

### Required Environment Variables:

- **NODE_ENV**: Set to `development` or `production`
- **JWT_SECRET**: A strong secret key for JWT token signing (minimum 32 characters recommended)
- **FRONTEND_URL**: The URL where your frontend is running (e.g., `http://localhost:3001`)
- **PG_CONNECTION_STRING**: PostgreSQL connection string
- **MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD**: Email service configuration

## Docker Setup

To start the PostgreSQL database with Docker:

```bash
docker-compose up -d
```

Set the database credentials in `.env.local`:
```
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_secure_password
```

## Database Migrations

We use TypeORM migrations instead of synchronize mode. To create a new migration:

```bash
# In apps/backend directory
npx typeorm migration:create src/migrations/migration-name
```

Migrations run automatically on startup when `migrationsRun: true` is set.

## Security Improvements Made

1. ✅ Password hashing moved from entity hooks to service layer
2. ✅ Removed hardcoded JWT secret fallback - now fails fast if JWT_SECRET is missing
3. ✅ Fixed CORS validation to fail if FRONTEND_URL is not configured
4. ✅ Removed auto-creation of admin user from code (use database seeders instead)
5. ✅ Disabled TypeORM synchronize mode - use migrations exclusively
6. ✅ Improved helmet security headers with CSP and HSTS
7. ✅ Added GET /auth/me endpoint to fetch authenticated user profile
8. ✅ Improved email verification flow with 24-hour registration window
9. ✅ Secured Docker Compose with environment variable support

## Recommended Next Steps

1. **Rate Limiting**: Install `@nestjs/throttler` to prevent brute force attacks
2. **Structured Logging**: Replace `console.log` with Winston logger
3. **Error Boundaries**: Add React error boundary in frontend
4. **Database Seeding**: Create a seeder for initial admin user instead of hardcoding
5. **Testing**: Add unit and e2e tests for authentication flows
6. **API Documentation**: Review and expand Swagger documentation
