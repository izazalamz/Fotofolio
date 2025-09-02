import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toastSlide, useReducedMotion } from '../lib/motion';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const reducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? '✓' : '✕';

  const variants = reducedMotion 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : toastSlide;

  return (
    <AnimatePresence>
      <motion.div 
        className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <span className="text-lg">{icon}</span>
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">×</button>
      </motion.div>
    </AnimatePresence>
  );
}
