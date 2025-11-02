# Email Templates

This directory contains transactional email templates built with [React Email](https://react.email/) and [Resend](https://resend.com/).

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Add your Resend API key to `.env`:

```bash
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Email Templates

- **VendorApprovalEmail** - Sent when a vendor is approved
- **VendorRejectionEmail** - Sent when vendor approval is revoked
- **AdminVendorSignupAlertEmail** - Alerts admins of new vendor signups
- **ForgotPasswordEmail** - Password reset email with secure link

## Shared Components

All templates use a consistent branded layout via:

- `EmailLayout` - Main wrapper with Tailwind CSS support
- `Header` - Drop Sigma branding
- `Footer` - Copyright and links
- `Button` - Reusable CTA button

## Usage

Email sending is handled automatically by the API routes:

- Vendor approval: `/api/vendors/[id]/approve` (PATCH)
- Vendor rejection: `/api/vendors/[id]/approve` (DELETE)
- New vendor signup: `/api/auth/signup` (POST)
- Password reset: `/api/auth/reset-password` (POST with `sendResetEmail: true`)

You can also use the helper functions directly:

```typescript
import {
  sendVendorApprovalEmail,
  sendVendorRejectionEmail,
  sendAdminVendorAlertEmail,
  sendForgotPasswordEmail,
} from "@/lib/email";

await sendVendorApprovalEmail({
  vendorName: "John Doe",
  vendorEmail: "john@example.com",
  companyName: "ACME Corp",
});
```

## Development

To preview emails locally, you can use React Email's dev tools:

```bash
npx react-email dev
```

This will start a local server where you can view and test all email templates.
