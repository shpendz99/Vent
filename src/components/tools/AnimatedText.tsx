"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * AnimatedText is a small wrapper around framer‑motion's motion.div that
 * exposes a single `delay` prop and animates children with a slide/fade in
 * effect. It can be reused anywhere you need heading, paragraph or button
 * content to animate into view. The animation will slide the element up
 * slightly from below and fade it in.
 */
export default function AnimatedText({
  children,
  delay = 0,
  as: Component = "div",
  className = "",
}: {
  children: ReactNode;
  /**
   * A delay in seconds before the animation begins. Useful for sequencing
   * multiple elements one after another.
   */
  delay?: number;
  /**
   * By default AnimatedText renders a div. You can override this by passing
   * another element, e.g. "h1" or "p" to better suit your markup.
   */
  as?: any;
  /**
   * Additional tailwind classes to apply to the wrapper element.
   */
  className?: string;
}) {
  const variants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };
  // framer-motion doesn't support an `as` prop directly on motion.div. To
  // support rendering as arbitrary HTML tags we wrap the passed component with
  // motion(). If the passed component is a string (e.g. "h1") framer‑motion
  // will handle it correctly. For custom components you can wrap them
  // yourself before using AnimatedText.
  const MotionComponent: any = motion(Component);
  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      variants={variants}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}