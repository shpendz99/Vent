"use client";

import { useRouter } from "next/navigation";
import ResetPasswordRequest from "@/components/auth/ResetPasswordRequest";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className={[
          "w-full max-w-lg overflow-hidden rounded-2xl",
          "border border-white/10",
          "bg-gradient-to-b from-[#0b0f19]/90 to-[#070a12]/90",
          "shadow-[0_20px_80px_rgba(0,0,0,0.6)]",
          "ring-1 ring-white/[0.06]",
          "backdrop-blur-xl",
        ].join(" ")}
      >
        <div className="border-b border-white/10 px-4 py-3">
          <div className="text-[15px] font-medium text-white/85">
            Forgot password
          </div>
          <div className="mt-1 text-xs text-white/45">
            Enter your email and we’ll send you a secure reset link.
          </div>
        </div>

        <div className="px-5 py-5">
          <ResetPasswordRequest onBackToSignIn={() => router.push("/signin")} />
        </div>
      </div>
    </div>
  );
}
