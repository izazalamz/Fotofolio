import React from 'react';
import { motion } from 'framer-motion';
import { listContainer, listItem, imageHover, useReducedMotion } from '../lib/motion';

export default function ImageGrid({ images = [], onDelete, className = '' }) {
  const reducedMotion = useReducedMotion();
  
  if (!images.length) {
    return (
      <motion.div 
        className={`text-center py-8 text-gray-500 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p>No images uploaded yet.</p>
      </motion.div>
    );
  }

  const containerVariants = reducedMotion 
    ? { animate: { transition: { staggerChildren: 0.1 } } }
    : listContainer;
    
  const itemVariants = reducedMotion 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : listItem;

  return (
    <motion.div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {images.map((image) => (
        <motion.div 
          key={image.id} 
          className="relative group bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden"
          variants={itemVariants}
          {...(reducedMotion ? {} : imageHover)}
        >
          <img
            src={image.file_path}
            alt={image.caption || 'Portfolio image'}
            className="w-full h-48 object-cover"
          />
          
          {image.caption && (
            <div className="p-3 bg-white">
              <p className="text-sm text-gray-700 line-clamp-2">{image.caption}</p>
            </div>
          )}
          
          {onDelete && (
            <motion.button
              onClick={() => onDelete(image.id)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
              title="Delete image"
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              ×
            </motion.button>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
