import { Section, Row, Column, Text, Link } from "@react-email/components";

export function Footer() {
  return (
    <Section className="bg-slate-50 px-6 py-8 mt-8">
      <Row>
        <Column align="center">
          <Text className="text-sm text-slate-600 mb-2 mt-0">
            © {new Date().getFullYear()} Drop Sigma. All rights reserved.
          </Text>
          <Text className="text-xs text-slate-400 m-0">
            <Link href="#" className="text-blue-500 no-underline mr-4">
              Privacy Policy
            </Link>
            <Link href="#" className="text-blue-500 no-underline">
              Terms of Service
            </Link>
          </Text>
        </Column>
      </Row>
    </Section>
  );
}
