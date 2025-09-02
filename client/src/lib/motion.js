import { useReducedMotion as framerUseReducedMotion } from 'framer-motion';

// Hook to check for reduced motion preference
export const useReducedMotion = () => {
  return framerUseReducedMotion();
};

// Base page transition variants
export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } },
};

// Reduced motion variants (opacity only)
export const fadeUpReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// List container for stagger animations
export const listContainer = {
  animate: { 
    transition: { 
      staggerChildren: 0.04, 
      when: 'beforeChildren' 
    } 
  },
};

// List item variants
export const listItem = {
  initial: { opacity: 0, y: 6 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.2, ease: 'easeOut' } 
  },
  exit: { 
    opacity: 0, 
    y: -6, 
    transition: { duration: 0.15, ease: 'easeIn' } 
  },
};

// Reduced motion list item variants
export const listItemReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Modal variants
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalPanel = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.18, ease: 'easeOut' } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    transition: { duration: 0.15, ease: 'easeIn' } 
  },
};

// Toast variants
export const toastSlide = {
  initial: { y: 8, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.2, ease: 'easeOut' } 
  },
  exit: { 
    y: -8, 
    opacity: 0, 
    transition: { duration: 0.15, ease: 'easeIn' } 
  },
};

// Button hover variants
export const buttonHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

// Image grid hover variants
export const imageHover = {
  whileHover: { 
    y: -2,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  whileTap: { scale: 0.98 },
};

// Rating star pop animation
export const starPop = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.2, 1], 
    transition: { duration: 0.3, ease: 'easeOut' } 
  },
};

// Shake animation for validation errors
export const shake = {
  animate: {
    x: [0, -2, 2, -2, 2, 0],
    transition: { duration: 0.4, ease: 'easeInOut' }
  },
};

// Crossfade for state transitions
export const crossfade = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1, 
    transition: { duration: 0.2, ease: 'easeOut' } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.15, ease: 'easeIn' } 
  },
};

// Utility function to get appropriate variants based on reduced motion
export const getVariants = (reducedMotion, normalVariants, reducedVariants) => {
  return reducedMotion ? reducedVariants : normalVariants;
};
