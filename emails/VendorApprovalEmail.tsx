import { Section, Text, Heading } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";

interface VendorApprovalEmailProps {
  vendorName: string;
  companyName?: string;
  loginUrl: string;
}

export function VendorApprovalEmail({
  vendorName,
  companyName,
  loginUrl,
}: VendorApprovalEmailProps) {
  return (
    <EmailLayout>
      <Section className="px-6 py-8">
        <Heading className="text-2xl font-bold text-slate-800 mb-4 mt-0">
          Your Vendor Account Has Been Approved! 🎉
        </Heading>
        <Text className="text-base text-slate-600 leading-relaxed mb-4 mt-0">
          Hi {vendorName},
        </Text>
        <Text className="text-base text-slate-600 leading-relaxed mb-4 mt-0">
          Great news! Your vendor account
          {companyName ? ` for ${companyName}` : ""} has been approved by our
          admin team.
        </Text>
        <Text className="text-base text-slate-600 leading-relaxed mb-6 mt-0">
          You can now access the Drop Sigma vendor portal and start managing
          your products and orders.
        </Text>
        <Button href={loginUrl}>Log In to Portal</Button>
        <Text className="text-sm text-slate-600 leading-relaxed mt-6 mb-0">
          If you have any questions, please don&apos;t hesitate to contact our
          support team.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default VendorApprovalEmail;
