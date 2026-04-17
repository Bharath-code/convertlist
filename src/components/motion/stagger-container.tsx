import React from "react";
import { motion } from "framer-motion";
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animations";

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className = "" }: StaggerContainerProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={staggerContainerVariants}
      className={className}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={staggerItemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
