import { Section, Text, Heading } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";

interface AdminVendorSignupAlertEmailProps {
  vendorName: string;
  vendorEmail: string;
  companyName?: string;
  phoneNumber?: string;
  approvalUrl: string;
}

export function AdminVendorSignupAlertEmail({
  vendorName,
  vendorEmail,
  companyName,
  phoneNumber,
  approvalUrl,
}: AdminVendorSignupAlertEmailProps) {
  return (
    <EmailLayout>
      <Section className="px-6 py-8">
        <Heading className="text-2xl font-bold text-slate-800 mb-4 mt-0">
          New Vendor Signup Pending Approval
        </Heading>
        <Text className="text-base text-slate-600 leading-relaxed mb-4 mt-0">
          A new vendor has signed up and is awaiting approval:
        </Text>
        <Section className="bg-slate-50 p-4 rounded-md mb-6">
          <Text className="text-sm text-slate-800 font-semibold mb-2 mt-0">
            Vendor Details:
          </Text>
          <Text className="text-sm text-slate-600 my-1">
            <strong>Name:</strong> {vendorName}
          </Text>
          <Text className="text-sm text-slate-600 my-1">
            <strong>Email:</strong> {vendorEmail}
          </Text>
          {companyName && (
            <Text className="text-sm text-slate-600 my-1">
              <strong>Company:</strong> {companyName}
            </Text>
          )}
          {phoneNumber && (
            <Text className="text-sm text-slate-600 my-1">
              <strong>Phone:</strong> {phoneNumber}
            </Text>
          )}
        </Section>
        <Button href={approvalUrl}>Review & Approve</Button>
        <Text className="text-sm text-slate-600 leading-relaxed mt-6 mb-0">
          Please review the vendor&apos;s application and take appropriate
          action.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default AdminVendorSignupAlertEmail;
