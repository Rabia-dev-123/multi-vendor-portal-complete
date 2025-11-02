import { Section, Text, Heading } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";

interface VendorRejectionEmailProps {
  vendorName: string;
  companyName?: string;
  reason?: string;
  supportUrl: string;
}

export function VendorRejectionEmail({
  vendorName,
  companyName,
  reason,
  supportUrl,
}: VendorRejectionEmailProps) {
  return (
    <EmailLayout>
      <Section className="px-6 py-8">
        <Heading className="text-2xl font-bold text-slate-800 mb-4 mt-0">
          Update on Your Vendor Application
        </Heading>
        <Text className="text-base text-slate-600 leading-relaxed mb-4 mt-0">
          Hi {vendorName},
        </Text>
        <Text className="text-base text-slate-600 leading-relaxed mb-4 mt-0">
          Thank you for your interest in becoming a vendor on Drop Sigma
          {companyName ? ` with ${companyName}` : ""}.
        </Text>
        <Text className="text-base text-slate-600 leading-relaxed mb-4 mt-0">
          After careful review, we regret to inform you that your vendor
          application has been declined at this time.
        </Text>
        {reason && (
          <Section className="bg-red-50 p-4 rounded-md mb-4">
            <Text className="text-sm text-red-900 font-semibold m-0">
              Reason:
            </Text>
            <Text className="text-sm text-red-600 mt-2 mb-0">{reason}</Text>
          </Section>
        )}
        <Text className="text-base text-slate-600 leading-relaxed mb-6 mt-0">
          If you have any questions or would like to discuss this decision,
          please feel free to contact our support team.
        </Text>
        <Button href={supportUrl}>Contact Support</Button>
      </Section>
    </EmailLayout>
  );
}

export default VendorRejectionEmail;
