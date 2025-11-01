import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orderly",
  description: "platform for managing your orders and vendors",
};

export default function SignUp() {
  return <SignUpForm />;
}
