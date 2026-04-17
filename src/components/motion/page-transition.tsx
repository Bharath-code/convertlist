import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUpVariants, transitionPresets } from "@/lib/animations";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={window.location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeInUpVariants}
        transition={transitionPresets.default}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
