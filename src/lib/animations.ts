import { Variants, Transition } from "framer-motion";

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Animation variants that respect reduced motion
export const createVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    return {
      initial: {},
      animate: {},
      exit: {},
    };
  }
  return variants;
};

// Common animation presets
export const fadeInVariants = createVariants({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
});

export const fadeInUpVariants = createVariants({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
});

export const fadeInDownVariants = createVariants({
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
});

export const scaleInVariants = createVariants({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
});

export const slideInRightVariants = createVariants({
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
});

export const slideInLeftVariants = createVariants({
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
});

// Staggered children animation
export const staggerContainerVariants = createVariants({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
});

export const staggerItemVariants = createVariants({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
});

// Transition presets
export const transitionPresets: Record<string, Transition> = {
  default: {
    duration: 0.3,
    ease: [0.16, 1, 0.3, 1], // ease-out
  },
  fast: {
    duration: 0.15,
    ease: [0.16, 1, 0.3, 1],
  },
  slow: {
    duration: 0.5,
    ease: [0.16, 1, 0.3, 1],
  },
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
};

// Hover animation hook
export const useHoverAnimation = () => ({
  whileHover: prefersReducedMotion() ? {} : { scale: 1.02, y: -2 },
  whileTap: prefersReducedMotion() ? {} : { scale: 0.98 },
  transition: transitionPresets.fast,
});

// Button animation hook
export const useButtonAnimation = () => ({
  whileHover: prefersReducedMotion() ? {} : { scale: 1.02, y: -1 },
  whileTap: prefersReducedMotion() ? {} : { scale: 0.98 },
  transition: transitionPresets.fast,
});

// Card animation hook
export const useCardAnimation = () => ({
  whileHover: prefersReducedMotion() ? {} : { 
    scale: 1.02, 
    y: -4,
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },
  transition: transitionPresets.default,
});

// Modal animation variants
export const modalVariants = createVariants({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
});

export const modalContentVariants = createVariants({
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
});

// Tooltip animation variants
export const tooltipVariants = createVariants({
  initial: { opacity: 0, scale: 0.95, y: 4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 4 },
});

// Progress bar animation
export const progressVariants = {
  initial: { width: 0 },
  animate: { width: "var(--progress)" },
  transition: {
    duration: 1,
    ease: [0.16, 1, 0.3, 1],
  },
};

// Shimmer effect for skeletons
export const shimmerVariants = {
  initial: { x: "-100%" },
  animate: { x: "100%" },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "linear",
  },
};
