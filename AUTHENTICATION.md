# Authentication Implementation Guide

This document provides a comprehensive guide to the NextAuth authentication system implemented in the Multi-Vendor Portal.

## 🎯 Overview

The authentication system uses **NextAuth v5 (Auth.js Beta)** with credentials-based authentication, role-based access control (RBAC), and feature flags for granular permissions.

## 📦 Dependencies

- `next-auth@beta` (v5.0.0-beta.30)
- `bcrypt` (v6.0.0)
- `@types/bcrypt` (v6.0.0)

## 🔐 Features Implemented

### 1. **User Authentication**

- Email/password login using bcrypt for password hashing
- JWT-based session management
- Automatic session refresh
- "Remember me" functionality

### 2. **Vendor Signup**

- Self-registration with pending approval workflow
- Password hashing with bcrypt (10 salt rounds)
- Optional fields: company name, phone number
- Success message: "Signup successful, pending admin approval"

### 3. **Password Reset**

- Simple email + new password flow
- Password verification and hashing
- User-friendly success/error notifications

### 4. **Role-Based Access Control**

Three user roles with distinct permissions:

- **VENDOR**: Access to vendor dashboard and assigned orders
- **ADMIN**: Manage approvals, orders, disputes (based on feature flags)
- **SUPER_ADMIN**: Full system access, admin management

### 5. **Feature Flags**

Admins can have granular permissions stored in the `featureFlags` JSON field:

```json
{
  "canApproveVendors": true,
  "canManageOrders": true,
  "canViewReports": false
}
```

### 6. **Middleware Protection**

Automatic route protection based on user roles:

- Redirects unauthenticated users to `/signin`
- Redirects authenticated users from auth pages to their dashboard
- Prevents cross-role access (vendors can't access admin routes, etc.)

## 📁 File Structure

```
multi-vendor-portal/
├── auth.config.ts                 # NextAuth provider configuration
├── auth.ts                        # NextAuth instance & callbacks
├── middleware.ts                  # Route protection middleware
├── types/
│   └── next-auth.d.ts            # TypeScript type extensions
├── lib/
│   ├── auth.ts                   # Auth utility functions
│   └── prisma.ts                 # Prisma client
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts  # NextAuth API handler
│   │       ├── signup/route.ts         # Vendor signup endpoint
│   │       └── reset-password/route.ts # Password reset endpoint
│   ├── (full-width-pages)/(auth)/
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   └── (admin)/
│       ├── vendor/dashboard/page.tsx
│       ├── admin/dashboard/page.tsx
│       └── superadmin/dashboard/page.tsx
└── components/
    ├── auth/
    │   ├── SignInForm.tsx
    │   ├── SignUpForm.tsx
    │   ├── ResetPasswordForm.tsx
    │   ├── SignOutButton.tsx
    │   ├── RoleGuard.tsx
    │   └── FeatureFlagGuard.tsx
    └── providers/
        └── SessionProvider.tsx
```

## 🚀 Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/multi_vendor_portal"

# NextAuth
AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Generate Auth Secret

```bash
openssl rand -base64 32
```

### 3. Run Database Migrations

```bash
pnpm prisma migrate dev
```

### 4. Generate Prisma Client

```bash
pnpm prisma generate
```

### 5. Start Development Server

```bash
pnpm dev
```

## 🔑 User Roles & Permissions

### Vendor

- **Routes**: `/vendor/*`
- **Access**: Own products, assigned orders
- **Restrictions**: Must be approved (`approvedAt != null`)

### Admin

- **Routes**: `/admin/*`
- **Access**: Based on `featureFlags`
  - Vendor approvals
  - Order management
  - Dispute resolution
  - Reports (if permitted)
- **Restrictions**: Cannot access super admin functions

### Super Admin

- **Routes**: `/superadmin/*`
- **Access**: Full system access
  - Manage admins
  - System configuration
  - All vendor/admin functions

## 📝 Usage Examples

### Client-Side Session Access

```tsx
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

### Server-Side Session Access

```tsx
import { auth } from "@/auth";

export default async function ServerComponent() {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Role-Based Component Protection

```tsx
import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <div>Admin content here</div>
    </RoleGuard>
  );
}
```

### Feature Flag Checking

```tsx
import FeatureFlagGuard from "@/components/auth/FeatureFlagGuard";

export default function ConditionalFeature() {
  return (
    <FeatureFlagGuard
      flag="canApproveVendors"
      fallback={<div>Access denied</div>}
    >
      <div>Vendor approval interface</div>
    </FeatureFlagGuard>
  );
}
```

### Sign Out

```tsx
import SignOutButton from "@/components/auth/SignOutButton";

export default function Header() {
  return (
    <header>
      <SignOutButton />
    </header>
  );
}
```

## 🔄 Authentication Flow

### 1. Vendor Signup

```
User → Signup Form → API /api/auth/signup
  → Hash password with bcrypt
  → Create user with role=VENDOR, approvedAt=null
  → Return success message
  → Redirect to /signin after 3s
```

### 2. User Login

```
User → Login Form → NextAuth credentials provider
  → Verify user exists
  → Compare password with bcrypt
  → Check vendor approval (if vendor)
  → Update lastLoginAt
  → Create JWT session with role & featureFlags
  → Redirect to role-based dashboard
```

### 3. Password Reset

```
User → Reset Form → API /api/auth/reset-password
  → Verify user exists
  → Hash new password with bcrypt
  → Update passwordHash
  → Return success message
  → Redirect to /signin after 3s
```

### 4. Route Access

```
User requests /admin/dashboard
  → Middleware checks authentication
  → Middleware validates role=ADMIN
  → If valid: Allow access
  → If invalid: Redirect to appropriate dashboard
  → If not authenticated: Redirect to /signin
```

## 🛡️ Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Sessions**: 30-day expiration
3. **Secure Routes**: Middleware-based protection
4. **Role Validation**: Server-side role checks
5. **Approval Workflow**: Vendors must be approved before login
6. **Last Login Tracking**: Automatic `lastLoginAt` updates

## 📊 Database Schema

The authentication system uses the following User model:

```prisma
enum UserRole {
  SUPER_ADMIN
  ADMIN
  VENDOR
}

model User {
  id           Int       @id @default(autoincrement())
  name         String
  email        String    @unique
  passwordHash String
  role         UserRole  @default(VENDOR)

  // Vendor fields
  companyName  String?
  phoneNumber  String?
  address      String?
  website      String?
  taxId        String?
  approvedAt   DateTime?
  approvedById Int?

  // Admin fields
  designation  String?
  featureFlags Json?

  // Relations
  approvedBy      User?    @relation("UserApprover", fields: [approvedById], references: [id])
  approvedVendors User[]   @relation("UserApprover")

  // Metadata
  lastLoginAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## 🎨 UI Components

All authentication forms use the existing TailAdmin UI components:

- `Input` - Form input fields
- `Label` - Form labels
- `Button` - Action buttons
- `Checkbox` - Agreement checkboxes
- Consistent dark mode support
- Error/success notifications

## 🔧 Utility Functions

Located in `lib/auth.ts`:

```typescript
// Get current session (server-side)
const session = await getSession();

// Check feature flag
const canApprove = hasFeatureFlag(user.featureFlags, "canApproveVendors");

// Check user role
const isAdmin = hasRole(user.role, ["ADMIN", "SUPER_ADMIN"]);

// Get redirect URL based on role
const dashboardUrl = getRoleBasedRedirect(user.role);
```

## 📧 Email Notifications (Future Enhancement)

Recommended email triggers:

1. **Vendor Approval**: Notify vendor when account is approved
2. **Password Reset Confirmation**: Confirm password was changed
3. **New Vendor Signup**: Notify admins of pending approval

## 🐛 Troubleshooting

### Issue: "Invalid email or password"

- Verify email exists in database
- Check password is correct
- Ensure vendor is approved (if vendor role)

### Issue: "Pending approval" error

- Vendor account needs admin approval
- Admin must set `approvedAt` timestamp and `approvedById`

### Issue: Redirects not working

- Verify `NEXTAUTH_URL` in `.env` matches your app URL
- Check middleware matcher patterns
- Ensure role is correctly set in database

### Issue: Session not persisting

- Verify `AUTH_SECRET` is set in `.env`
- Check browser cookies are enabled
- Confirm JWT is being created in auth callbacks

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Prisma Documentation](https://www.prisma.io/docs)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)

## ✅ Testing Checklist

- [ ] Vendor can sign up
- [ ] Unapproved vendor cannot log in
- [ ] Approved vendor can log in
- [ ] Admin can log in
- [ ] Super admin can log in
- [ ] Password reset works
- [ ] Role-based redirects work
- [ ] Middleware blocks unauthorized access
- [ ] Session persists across page refreshes
- [ ] Sign out works correctly
- [ ] Feature flags work for admins
- [ ] Last login updates correctly

---

**Implementation Date**: October 31, 2025
**NextAuth Version**: 5.0.0-beta.30
**Developer**: AI Assistant
