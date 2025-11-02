import { Button as EmailButton } from "@react-email/components";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
}

export function Button({ href, children }: ButtonProps) {
  return (
    <EmailButton
      href={href}
      className="bg-blue-500 text-white px-6 py-3 rounded-md no-underline inline-block font-semibold text-sm"
    >
      {children}
    </EmailButton>
  );
}
