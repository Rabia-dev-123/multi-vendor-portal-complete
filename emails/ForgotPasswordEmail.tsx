import { Section, Text, Heading } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";

interface ForgotPasswordEmailProps {
  userName: string;
  resetUrl: string;
  expiresIn?: string;
}

export function ForgotPasswordEmail({
  userName,
  resetUrl,
  expiresIn = "1 hour",
}: ForgotPasswordEmailProps) {
  return (
    <EmailLayout>
      <Section className="px-6 py-8">
        <Heading className="text-2xl font-bold text-slate-800 mb-4 mt-0">
          Reset Your Password
        </Heading>
        <Text className="text-base text-slate-600 leading-relaxed mb-4 mt-0">
          Hi {userName},
        </Text>
        <Text className="text-base text-slate-600 leading-relaxed mb-4 mt-0">
          We received a request to reset your password for your Drop Sigma
          account.
        </Text>
        <Text className="text-base text-slate-600 leading-relaxed mb-6 mt-0">
          Click the button below to reset your password:
        </Text>
        <Button href={resetUrl}>Reset Password</Button>
        <Section className="bg-yellow-50 p-4 rounded-md my-6">
          <Text className="text-sm text-yellow-900 m-0">
            ⚠️ This link will expire in {expiresIn}. If you didn&apos;t request
            this, please ignore this email.
          </Text>
        </Section>
        <Text className="text-sm text-slate-600 leading-relaxed m-0">
          For security reasons, if you did not request a password reset, please
          contact our support team immediately.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default ForgotPasswordEmail;
