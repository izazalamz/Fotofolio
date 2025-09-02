import React from 'react';
import { motion } from 'framer-motion';
import RatingStars from './RatingStars';
import { listContainer, listItem, useReducedMotion } from '../lib/motion';

export default function ReviewList({ reviews = [], loading = false, onLoadMore, hasMore = false }) {
  const reducedMotion = useReducedMotion();
  
  if (loading && !reviews.length) {
    return (
      <motion.div 
        className="text-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading reviews...</p>
      </motion.div>
    );
  }

  if (!reviews.length) {
    return (
      <motion.div 
        className="text-center py-8 text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p>No reviews yet.</p>
      </motion.div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const containerVariants = reducedMotion 
    ? { animate: { transition: { staggerChildren: 0.1 } } }
    : listContainer;
    
  const itemVariants = reducedMotion 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : listItem;

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {reviews.map((review) => (
        <motion.div 
          key={review.id} 
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/60"
          variants={itemVariants}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <RatingStars value={review.rating} size="sm" readOnly />
              <span className="text-sm text-gray-500">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
          
          {review.comment && (
            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
          )}
        </motion.div>
      ))}
      
      {hasMore && (
        <motion.div 
          className="text-center pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={onLoadMore}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'See more reviews'}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
