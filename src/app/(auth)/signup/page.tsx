"use client";

import SignUpWizard from "@/components/auth/SignUpWizard";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <SignUpWizard onDone={() => {}} onSwitchToSignIn={() => {}} />
      </div>
    </div>
  );
}
