"use client";

import { useRouter } from "next/navigation";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <SignInForm
          onDone={() => {}}
          onSwitchToSignUp={() => router.push("/signup")}
          onForgotPassword={() => router.push("/forgot-password")} // ✅ FIX
        />
      </div>
    </div>
  );
}
