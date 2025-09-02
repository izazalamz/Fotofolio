import React from 'react';
import { motion } from 'framer-motion';
import { starPop, useReducedMotion } from '../lib/motion';

export default function RatingStars({ 
  value = 0, 
  size = 'md', 
  readOnly = true, 
  onChange,
  className = '' 
}) {
  const reducedMotion = useReducedMotion();
  
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const starSize = sizes[size];

  const handleStarClick = (starValue) => {
    if (!readOnly && onChange) {
      onChange(starValue);
    }
  };

  const renderStar = (starValue) => {
    const isFilled = starValue <= value;
    const starClass = `inline-block ${starSize} cursor-pointer transition-colors ${
      readOnly ? 'cursor-default' : 'hover:scale-110'
    } ${className}`;

    const motionProps = !readOnly && !reducedMotion ? {
      whileHover: { scale: 1.1 },
      whileTap: { scale: 0.95 },
      animate: starValue === value ? "pop" : "initial",
      variants: starPop,
      transition: { duration: 0.2 }
    } : {};

    if (isFilled) {
      return (
        <motion.span
          key={starValue}
          className={`${starClass} text-yellow-400`}
          onClick={() => handleStarClick(starValue)}
          {...motionProps}
        >
          ★
        </motion.span>
      );
    } else {
      return (
        <motion.span
          key={starValue}
          className={`${starClass} text-gray-300 hover:text-yellow-200`}
          onClick={() => handleStarClick(starValue)}
          {...motionProps}
        >
          ☆
        </motion.span>
      );
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  );
}
