"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingScreen from "@/components/layout/LoadingScreen";

export default function ClientLayout({
  children,
  hasAuthCookie = false,
}: {
  children: React.ReactNode;
  hasAuthCookie?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(hasAuthCookie);

  useEffect(() => {
    if (!isLoading) return;

    // Check if the user has already seen the splash screen in this session
    const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");

    if (hasSeenLoader) {
      setIsLoading(false);
    } else {
      // Artificial delay to let assets load (3 seconds)
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem("hasSeenLoader", "true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <LoadingScreen key="loader" />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
