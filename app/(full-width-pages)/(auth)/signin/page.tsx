import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orderly",
  description: "platform for managing your orders and vendors",
};

export default function SignIn() {
  return <SignInForm />;
}
