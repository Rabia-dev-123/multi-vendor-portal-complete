# Setup Guide - Multi-Vendor Portal

Quick start guide to get your authentication system up and running.

## Prerequisites

- Node.js 18+ and pnpm installed
- PostgreSQL database running
- Git (for version control)

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```bash
# Database URL
DATABASE_URL="postgresql://username:password@localhost:5432/multi_vendor_portal"

# NextAuth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your-generated-secret-here"

# App URL
NEXTAUTH_URL="http://localhost:3000"
```

**Generate a secure AUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 3. Database Setup

Run migrations to create tables:

```bash
pnpm prisma migrate dev
```

Generate Prisma client:

```bash
pnpm prisma generate
```

### 4. Seed Test Data

Populate the database with test users:

```bash
pnpm prisma db seed
```

This creates:

- **Super Admin**: superadmin@example.com
- **Admin**: admin@example.com
- **Approved Vendor**: vendor@example.com
- **Pending Vendor**: pending@example.com

All test accounts use password: `password123`

### 5. Start Development Server

```bash
pnpm dev
```

Visit: http://localhost:3000

## Testing the Authentication System

### Test User Credentials

| Role        | Email                  | Password    | Status              |
| ----------- | ---------------------- | ----------- | ------------------- |
| Super Admin | superadmin@example.com | password123 | ✅ Can login        |
| Admin       | admin@example.com      | password123 | ✅ Can login        |
| Vendor      | vendor@example.com     | password123 | ✅ Can login        |
| Vendor      | pending@example.com    | password123 | ❌ Pending approval |

### Test Scenarios

#### 1. Sign In

- Navigate to `/signin`
- Use any approved test credentials
- Should redirect to role-based dashboard

#### 2. Sign Up (New Vendor)

- Navigate to `/signup`
- Fill in the form with new vendor details
- Should show "Signup successful, pending admin approval"
- Cannot login until approved by admin

#### 3. Password Reset

- Navigate to `/reset-password`
- Enter email and new password
- Should show success message
- Can login with new password

#### 4. Role-Based Access

- Login as vendor → redirects to `/vendor/dashboard`
- Login as admin → redirects to `/admin/dashboard`
- Login as super admin → redirects to `/superadmin/dashboard`

#### 5. Unauthorized Access

- Try accessing `/admin/dashboard` as vendor
- Should redirect to vendor dashboard
- Middleware blocks cross-role access

#### 6. Pending Vendor Login

- Try logging in with `pending@example.com`
- Should show "Your account is pending approval"
- Cannot access system until admin approves

## Approving Pending Vendors

To approve a pending vendor (currently requires database access):

```sql
UPDATE "User"
SET "approvedAt" = NOW(),
    "approvedById" = (SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1)
WHERE email = 'pending@example.com';
```

Or use Prisma Studio:

```bash
pnpm prisma studio
```

Navigate to User model and set:

- `approvedAt`: Current timestamp
- `approvedById`: ID of an admin user

## Common Issues

### Issue: AUTH_SECRET not set

**Error**: NextAuth configuration error

**Solution**:

```bash
openssl rand -base64 32
# Copy output to .env as AUTH_SECRET
```

### Issue: Database connection failed

**Error**: Can't reach database server

**Solution**:

1. Verify PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Ensure database exists:

```bash
createdb multi_vendor_portal
```

### Issue: Prisma client outdated

**Error**: Prisma client version mismatch

**Solution**:

```bash
pnpm prisma generate
```

### Issue: Migration fails

**Error**: Migration cannot be applied

**Solution**:

```bash
# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset

# Or create new migration
pnpm prisma migrate dev --name fix_migration
```

## Development Commands

```bash
# Start dev server
pnpm dev

# Run linter
pnpm lint

# Format code (if configured)
pnpm format

# View database in browser
pnpm prisma studio

# Reset database
pnpm prisma migrate reset

# Create new migration
pnpm prisma migrate dev --name migration_name

# Seed database
pnpm prisma db seed
```

## Project Structure

```
multi-vendor-portal/
├── app/
│   ├── api/auth/           # Auth API endpoints
│   ├── (admin)/            # Protected admin routes
│   └── (full-width-pages)/ # Auth pages (signin, signup)
├── components/
│   ├── auth/               # Auth components
│   └── providers/          # React providers
├── lib/
│   ├── auth.ts            # Auth utilities
│   └── prisma.ts          # Prisma client
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── auth.config.ts         # NextAuth config
├── auth.ts                # NextAuth instance
└── middleware.ts          # Route protection
```

## Next Steps

After setup is complete:

1. **Create Admin Approval UI** - Build interface for admins to approve vendors
2. **Email Notifications** - Implement email service for signup/approval notifications
3. **Profile Management** - Allow users to update their profiles
4. **Password Strength** - Add password requirements and validation
5. **Two-Factor Auth** - Implement 2FA for enhanced security
6. **Session Management** - Add ability to view/revoke active sessions
7. **Audit Logs** - Track authentication events

## Resources

- [Full Authentication Guide](./AUTHENTICATION.md)
- [NextAuth Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)

## Support

If you encounter issues:

1. Check [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed documentation
2. Verify all environment variables are set correctly
3. Ensure database migrations are up to date
4. Check browser console and server logs for errors

---

**Happy Coding!** 🚀
