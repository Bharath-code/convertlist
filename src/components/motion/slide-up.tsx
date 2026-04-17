import React from "react";
import { motion } from "framer-motion";
import { fadeInUpVariants, transitionPresets } from "@/lib/animations";

interface SlideUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function SlideUp({ children, delay = 0, className = "" }: SlideUpProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInUpVariants}
      transition={{ ...transitionPresets.default, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
