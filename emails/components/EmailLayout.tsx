import {
  Html,
  Head,
  Body,
  Container,
  Tailwind,
  Font,
} from "@react-email/components";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface EmailLayoutProps {
  children: React.ReactNode;
}

export function EmailLayout({ children }: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Tailwind>
        <Body className="bg-slate-100 font-sans">
          <Container className="bg-white max-w-[600px] mx-auto my-10 rounded-lg overflow-hidden shadow-md">
            <Header />
            {children}
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
