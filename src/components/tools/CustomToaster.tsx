// src/components/tools/CustomToaster.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/hooks/use-toast-store";

export function CustomToaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`
              pointer-events-auto cursor-pointer min-w-[280px] p-4 
              rounded-xl border shadow-2xl backdrop-blur-md flex items-center gap-3
              ${toast.type === 'success' 
                ? "bg-[#0b0f19]/90 border-sky-500/30 text-white" 
                : "bg-red-950/40 border-red-500/30 text-red-200"}
            `}
            onClick={() => removeToast(toast.id)}
          >
            <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-sky-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-[13px] font-medium tracking-tight leading-none">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}