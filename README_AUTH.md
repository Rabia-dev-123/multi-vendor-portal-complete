# Authentication System - Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database URL and generate AUTH_SECRET

# 3. Setup database
pnpm prisma migrate dev
pnpm prisma generate
pnpm prisma db seed

# 4. Start server
pnpm dev
```

## 🔑 Test Credentials

| User Type | Email | Password | Access |
|-----------|-------|----------|--------|
| Super Admin | superadmin@example.com | password123 | Full access |
| Admin | admin@example.com | password123 | Admin dashboard |
| Vendor | vendor@example.com | password123 | Vendor dashboard |
| Pending Vendor | pending@example.com | password123 | ❌ Not approved |

## 📍 Routes

### Public Routes
- `/signin` - Login page
- `/signup` - Vendor registration
- `/reset-password` - Password reset

### Protected Routes
- `/vendor/dashboard` - Vendor only
- `/admin/dashboard` - Admin only
- `/superadmin/dashboard` - Super Admin only

## 💻 Code Examples

### Get Session (Client)
```tsx
"use client";
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  return <div>Welcome {session?.user.name}</div>;
}
```

### Get Session (Server)
```tsx
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  return <div>Welcome {session?.user.name}</div>;
}
```

### Sign Out
```tsx
import SignOutButton from "@/components/auth/SignOutButton";

export default function Header() {
  return <SignOutButton />;
}
```

### Role Protection
```tsx
import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AdminContent />
    </RoleGuard>
  );
}
```

### Feature Flag Check
```tsx
import FeatureFlagGuard from "@/components/auth/FeatureFlagGuard";

export default function Feature() {
  return (
    <FeatureFlagGuard flag="canApproveVendors">
      <VendorApprovalUI />
    </FeatureFlagGuard>
  );
}
```

## 🔧 Utility Functions

```typescript
import { hasFeatureFlag, hasRole, getRoleBasedRedirect } from "@/lib/auth";

// Check feature flag
const canApprove = hasFeatureFlag(user.featureFlags, "canApproveVendors");

// Check role
const isAdmin = hasRole(user.role, ["ADMIN", "SUPER_ADMIN"]);

// Get redirect URL
const dashboardUrl = getRoleBasedRedirect(user.role);
```

## 📦 API Endpoints

### Sign Up
```typescript
POST /api/auth/signup
Body: {
  name: string,
  email: string,
  password: string,
  companyName?: string,
  phoneNumber?: string
}
```

### Reset Password
```typescript
POST /api/auth/reset-password
Body: {
  email: string,
  newPassword: string
}
```

### Sign In
```typescript
POST /api/auth/signin
Body: {
  email: string,
  password: string
}
```

## 🎯 Features

✅ Email/password authentication  
✅ Role-based access control  
✅ Feature flags for admins  
✅ Vendor approval workflow  
✅ Password reset  
✅ JWT sessions (30 days)  
✅ Last login tracking  
✅ Route middleware protection  
✅ Dark mode support  
✅ TypeScript support  

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Installation and configuration
- [Authentication Guide](./AUTHENTICATION.md) - Complete documentation
- [Prisma Schema](./prisma/schema.prisma) - Database structure

## 🎨 Components

```
components/auth/
├── SignInForm.tsx          # Login form
├── SignUpForm.tsx          # Vendor registration
├── ResetPasswordForm.tsx   # Password reset
├── SignOutButton.tsx       # Logout button
├── RoleGuard.tsx          # Role-based protection
└── FeatureFlagGuard.tsx   # Feature flag protection
```

## 🔐 Security

- Bcrypt password hashing (10 rounds)
- JWT session tokens
- HTTP-only cookies
- CSRF protection
- Route middleware
- Role validation
- Approval workflow

## 🐛 Troubleshooting

**Can't login?**
- Check email/password are correct
- Vendors: Verify account is approved
- Check browser console for errors

**Redirecting incorrectly?**
- Clear browser cookies
- Verify NEXTAUTH_URL in .env
- Check middleware configuration

**Database errors?**
- Run `pnpm prisma generate`
- Verify DATABASE_URL
- Check PostgreSQL is running

## 📞 Support

Need help? Check:
1. [SETUP.md](./SETUP.md) - Setup instructions
2. [AUTHENTICATION.md](./AUTHENTICATION.md) - Detailed docs
3. Console logs for error messages

---

**Version**: 1.0.0  
**Last Updated**: October 31, 2025

