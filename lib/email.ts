import { resend } from "./resend";
import { VendorApprovalEmail } from "@/emails/VendorApprovalEmail";
import { VendorRejectionEmail } from "@/emails/VendorRejectionEmail";
import { AdminVendorSignupAlertEmail } from "@/emails/AdminVendorSignupAlertEmail";
import { ForgotPasswordEmail } from "@/emails/ForgotPasswordEmail";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVendorApprovalEmail(data: {
  vendorName: string;
  vendorEmail: string;
  companyName?: string | null;
}) {
  const loginUrl = `${BASE_URL}/signin`;

  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.vendorEmail,
      subject: "Your Vendor Account Has Been Approved",
      react: VendorApprovalEmail({
        vendorName: data.vendorName,
        companyName: data.companyName || undefined,
        loginUrl,
      }),
    });

    return result;
  } catch (error) {
    console.error("Failed to send vendor approval email:", error);
    throw error;
  }
}

export async function sendVendorRejectionEmail(data: {
  vendorName: string;
  vendorEmail: string;
  companyName?: string | null;
  reason?: string;
}) {
  const supportUrl = `${BASE_URL}/contact`;

  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.vendorEmail,
      subject: "Update on Your Vendor Application",
      react: VendorRejectionEmail({
        vendorName: data.vendorName,
        companyName: data.companyName || undefined,
        reason: data.reason,
        supportUrl,
      }),
    });

    return result;
  } catch (error) {
    console.error("Failed to send rejection email:", error);
    throw error;
  }
}

export async function sendAdminVendorAlertEmail(data: {
  vendorName: string;
  vendorEmail: string;
  companyName?: string | null;
  phoneNumber?: string | null;
  adminEmails: string[];
}) {
  const approvalUrl = `${BASE_URL}/superadmin/vendors`;

  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.adminEmails,
      subject: "New Vendor Signup - Approval Required",
      react: AdminVendorSignupAlertEmail({
        vendorName: data.vendorName,
        vendorEmail: data.vendorEmail,
        companyName: data.companyName || undefined,
        phoneNumber: data.phoneNumber || undefined,
        approvalUrl,
      }),
    });

    return result;
  } catch (error) {
    console.error("Failed to send admin alert email:", error);
    throw error;
  }
}

export async function sendForgotPasswordEmail(data: {
  userName: string;
  userEmail: string;
  resetUrl: string;
  expiresIn?: string;
}) {
  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.userEmail,
      subject: "Reset Your Password",
      react: ForgotPasswordEmail({
        userName: data.userName,
        resetUrl: data.resetUrl,
        expiresIn: data.expiresIn,
      }),
    });

    return result;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}
