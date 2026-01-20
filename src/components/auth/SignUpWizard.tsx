"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepAccount from "./steps/StepAccount";
import StepIntent from "./steps/StepIntent";
import StepVerify from "./steps/StepVerify";

type Props = {
  onDone: () => void;
  onSwitchToSignIn: () => void;
};

export default function SignUpWizard({ onDone, onSwitchToSignIn }: Props) {
  const [step, setStep] = useState(1);

  // Collected across steps
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // NEW: Identity States
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [intent, setIntent] = useState("");

  const progress = useMemo(() => (step / 3) * 100, [step]);

  const motionProps = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.22 }
  };

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-xs text-white/60">
          {step}
        </div>
        <div className="h-2 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full bg-white/25 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-white/45">3</div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" {...motionProps} className="space-y-4">
            <StepAccount
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
              onNext={() => setStep(2)}
              onSwitchToSignIn={onSwitchToSignIn}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" {...motionProps} className="space-y-4">
            <StepIntent
              username={username}
              setUsername={setUsername}
              displayName={displayName}
              setDisplayName={setDisplayName}
              intent={intent}
              setIntent={setIntent}
              onPrev={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" {...motionProps} className="space-y-4">
            <StepVerify
              email={email}
              password={password}
              username={username}
              displayName={displayName}
              intent={intent}
              onPrev={() => setStep(2)}
              onDone={onDone}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}