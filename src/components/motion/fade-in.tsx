import React from "react";
import { motion } from "framer-motion";
import { fadeInVariants, transitionPresets } from "@/lib/animations";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInVariants}
      transition={{ ...transitionPresets.default, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
