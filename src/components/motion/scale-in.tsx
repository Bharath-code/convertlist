import React from "react";
import { motion } from "framer-motion";
import { scaleInVariants, transitionPresets } from "@/lib/animations";

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, className = "" }: ScaleInProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={scaleInVariants}
      transition={{ ...transitionPresets.spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
