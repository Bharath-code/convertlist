import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function SignUpPage() {
  return (
    <SignUp
      routing="hash"
      afterSignUpUrl="/dashboard"
      afterSignInUrl="/dashboard"
    />
  );
}
