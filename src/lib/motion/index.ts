import { Variants } from "framer-motion";

// Basic Fades
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.5, ease: "easeInOut" } 
  },
};

// Scaling
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  },
};

// Sliding
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
};

// Containers
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Transitions
export const pageTransition: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" } 
  },
  exit: { 
    opacity: 0, 
    filter: "blur(10px)",
    transition: { duration: 0.3, ease: "easeIn" } 
  },
};

export const modalTransition: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 } 
  },
};

// Hovers (WhileHover properties typically, but defined as variants if needed)
export const cardHover = {
  rest: { scale: 1, y: 0, boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)" },
  hover: { 
    scale: 1.02, 
    y: -4, 
    boxShadow: "0 20px 40px -10px rgba(13, 92, 79, 0.15)",
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

// Domain specific
export const treeGrowthMotion: Variants = {
  hidden: { scaleY: 0, opacity: 0, transformOrigin: "bottom" },
  visible: { 
    scaleY: 1, 
    opacity: 1, 
    transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } 
  },
};
