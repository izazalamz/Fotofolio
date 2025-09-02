import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdrop, modalPanel, useReducedMotion } from '../lib/motion';

export default function Modal({ isOpen, onClose, title, children, actions }) {
  const reducedMotion = useReducedMotion();
  
  const backdropVariants = reducedMotion 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : modalBackdrop;
    
  const panelVariants = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : modalPanel;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={onClose}
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
          <motion.div 
            className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="mb-6">{children}</div>
            <div className="flex gap-3 justify-end">
              {actions}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
