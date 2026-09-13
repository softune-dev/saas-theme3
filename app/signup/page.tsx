import type { Metadata } from "next";
import { SignupPageClient } from "./SignupPageClient";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an account to get started",
};

export default function SignupPage() {
  return <SignupPageClient />;
}
