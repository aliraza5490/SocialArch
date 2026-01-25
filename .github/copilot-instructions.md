# SocialArch - Coding Agent Instructions

## Architecture Overview

**SocialArch** is a monorepo social media platform using **Turbo**, **NestJS** backend, and **Next.js** frontend.

- **Monorepo Structure**: `pnpm` workspaces with Turbo for task orchestration
- **Backend**: `apps/backend/` - NestJS + TypeORM + PostgreSQL (pgvector)
- **Frontend**: `apps/frontend/` - Next.js + React Hook Form + Zod
- **Shared**: `packages/` - ESLint config, TypeScript config, UI library

### Key Decisions

- **Migrations, Never Sync**: TypeORM `synchronize: false` - all schema changes via migrations in `apps/backend/src/migrations/`
- **No Environment Fallbacks**: JWT_SECRET and FRONTEND_URL must be set; fails fast on misconfiguration
- **Global Auth Guard**: `AuthGuard` applied globally via `APP_GUARD` in [app.module.ts](../apps/backend/src/app.module.ts#L15) - requires `@Public()` decorator for public routes
- **Structured Validation**: Environment variables validated with class-validator in [config.ts](../apps/backend/src/config.ts) at startup
- **Rate Limiting**: `RateLimitInterceptor` applied globally for auth endpoints protection

## Development Workflow

### Install & Run (from root)

```bash
pnpm install                    # Install all workspaces
pnpm run dev                    # Start all dev servers (backend:3000, frontend:3001)
pnpm run build                  # Compile all workspaces
pnpm run lint                   # ESLint all packages
pnpm run check-types            # TypeScript check
docker-compose up -d            # Start PostgreSQL (required once)
```

### Backend-Specific (from `apps/backend/`)

```bash
pnpm run start:dev              # Watch mode with hot reload
pnpm run test                   # Unit tests
pnpm run test:e2e              # E2E tests
pnpm run test:cov              # Coverage report
```

### Frontend-Specific (from `apps/frontend/`)

```bash
pnpm run dev                    # Next.js dev server (port 3001)
pnpm run build && pnpm run start  # Production build
```

### Database Migrations

```bash
# From apps/backend/
npx typeorm migration:create src/migrations/DescriptiveNameHere
# Edit migration file, then commit/deploy (runs auto on app startup via migrationsRun: true)
```

## Code Patterns & Conventions

### NestJS Module Structure

Each feature module (e.g., [auth/](../apps/backend/src/auth/)) follows:

- `auth.module.ts` - DI container (imports, providers, controllers)
- `auth.controller.ts` - HTTP endpoints with `@ApiOperation()` Swagger docs
- `auth.service.ts` - Business logic
- `entities/` - TypeORM entities (e.g., `User.entity.ts`, `AuthToken.entity.ts`)
- `dto/` - DTOs for request validation (class-validator decorators)
- `guards/` - Custom guards (e.g., `AuthGuard` checks JWT tokens)
- `subscribers/` - TypeORM entity subscribers for side effects (e.g., cleanup on delete)

### Authentication Flow

1. **Register**: `POST /auth/register` → hash password in service → save `User` → send email
2. **Login**: `POST /auth/login` → verify password → create JWT token → log in `LoginLog`
3. **Protected Routes**: `AuthGuard` extracts JWT, validates, injects user into request
4. **Profile**: `GET /auth/me` (protected) → returns full `User` object with roles

### Endpoint Examples

- **Public** (no auth required): `POST /auth/register`, `POST /auth/login`
- **Protected** (requires JWT): `GET /auth/me`, `PATCH /user/profile`
- **Swagger Docs**: Available at `/docs` - update `@ApiOperation()` in controllers

### Frontend Data Layer

- **HTTP Client**: [lib/api-client.ts](../apps/frontend/lib/api-client.ts) - axios instance with base URL
- **React Query**: [lib/services/](../apps/frontend/lib/services/) - query hooks (`useGetUser`, `useLogin`)
- **Auth Context**: [lib/contexts/auth-context.tsx](../apps/frontend/lib/contexts/auth-context.tsx) - user state management, calls `/auth/me` on init
- **Forms**: React Hook Form + Zod for validation (see [login-form.tsx](../apps/frontend/components/auth/login-form.tsx))

## Critical Conventions (Must Follow)

1. **Environment Variables**: Always access via `ConfigService` in NestJS, never hardcode. All required vars must have class-validator decorators in [config.ts](../apps/backend/src/config.ts)
2. **Password Handling**: Hash in `AuthService` methods, never in entity hooks. Use `bcryptjs` for hashing.
3. **Public Routes**: Mark with `@Public()` decorator (defined in [auth.guard.ts](../apps/backend/src/auth/guards/auth.guard.ts)). If missing, route defaults to requiring JWT.
4. **Email Verification**: Must expire within 24 hours; backend enforces via `EMAIL_VERIFICATION_TOKEN_EXPIRATION` (in seconds)
5. **CORS**: Must set `FRONTEND_URL` env var to exact origin (e.g., `http://localhost:3001`); dynamic origin validation in [main.ts](../apps/backend/src/main.ts)
6. **Helmet Security**: CSP, HSTS, and other headers enforced in [main.ts](../apps/backend/src/main.ts) - adjust only if necessary for assets
7. **TypeScript**: Strict mode enabled; use path aliases (`@/` for `src/` in backend, `@/` for `src/` in frontend)

## Common Tasks

- **Add Auth Endpoint**: Create method in `AuthService`, add decorated endpoint in `AuthController`, update DTOs/entities
- **Add Entity & Migration**: Create `.entity.ts`, create TypeORM migration, update module imports
- **Fix Type Errors**: Check [tsconfig.json](../apps/backend/tsconfig.json) - strict checking enabled
- **Debug Auth Issues**: Check `JWT_SECRET`, `FRONTEND_URL` env vars, and `AuthGuard` decorator logic
- **Update UI Component**: All UI in `components/` folder; use Tailwind + Shadcn components

## Security Checklist

- ✅ JWT_SECRET must be 32+ chars, randomly generated (not default)
- ✅ Password hashing happens in `AuthService.register()` before entity creation
- ✅ No sensitive data in error responses (use `SharedModule` exceptions)
- ✅ CORS only allows configured `FRONTEND_URL`
- ✅ Helmet headers protect against XSS/clickjacking
- ✅ TypeORM `synchronize: false` prevents accidental schema drops
- ✅ Migrations reviewed before deploy; `migrationsRun: true` auto-executes on startup

## Documentation Structure

**All documentation and implementation tracking files MUST go in the `docs/` folder.**

**DO NOT create documentation files in the root directory.** Root directory should only contain:

- `README.md` - Main project overview
- `package.json` - Monorepo config
- `docker-compose.yml` - Infrastructure setup
- `turbo.json` - Build configuration
- Configuration files (`.env.example`, `.gitignore`, etc.)

Documentation files stored in `docs/`:

- `docs/CHECKLIST.md` - Implementation status tracking
- `docs/IMPROVEMENTS.md` - Detailed change logs and improvements
- `docs/SETUP.md` - Setup and environment configuration

This keeps the root directory clean and centralizes all non-source documentation.

## File References

| File                                                                                          | Purpose                                         |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [apps/backend/src/main.ts](../apps/backend/src/main.ts)                                       | App bootstrap, Swagger, CORS, Helmet setup      |
| [apps/backend/src/app.module.ts](../apps/backend/src/app.module.ts)                           | Global guard/interceptor registration           |
| [apps/backend/src/config.ts](../apps/backend/src/config.ts)                                   | Env var validation schema                       |
| [apps/backend/src/auth/](../apps/backend/src/auth/)                                           | Authentication module (login, register, tokens) |
| [apps/frontend/lib/api-client.ts](../apps/frontend/lib/api-client.ts)                         | Axios HTTP client                               |
| [apps/frontend/lib/contexts/auth-context.tsx](../apps/frontend/lib/contexts/auth-context.tsx) | Global user state                               |
| [docker-compose.yml](../docker-compose.yml)                                                   | PostgreSQL + pgvector setup                     |
| [turbo.json](../turbo.json)                                                                   | Monorepo build task definitions                 |
