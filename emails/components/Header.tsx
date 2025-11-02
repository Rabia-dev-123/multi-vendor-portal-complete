import { Section, Row, Column, Heading } from "@react-email/components";

export function Header() {
  return (
    <Section className="bg-slate-800 py-6">
      <Row>
        <Column align="center">
          {/* <Img
            src="https://via.placeholder.com/150x40/3B82F6/ffffff?text=Drop+Sigma"
            width="150"
            height="40"
            alt="Drop Sigma"
            className="mx-auto"
          /> */}
          <Heading className="text-white text-2xl font-bold">
            Drop Sigma
          </Heading>
        </Column>
      </Row>
    </Section>
  );
}
