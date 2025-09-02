import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioApi, reviewsApi } from '../lib/api';
import ImageGrid from '../components/ImageGrid';
import ReviewList from '../components/ReviewList';
import RatingStars from '../components/RatingStars';
import Toast from '../components/Toast';
import { fadeUp, useReducedMotion } from '../lib/motion';

export default function PhotographerProfile() {
  const reducedMotion = useReducedMotion();
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [reviewsOffset, setReviewsOffset] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  useEffect(() => {
    loadPhotographerData();
  }, [id]);

  const loadPhotographerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [portfolioData, summaryData, reviewsData] = await Promise.all([
        portfolioApi.listPortfolio(id),
        reviewsApi.getReviewSummary(id),
        reviewsApi.getPhotographerReviews(id, { limit: 10, offset: 0 })
      ]);
      
      setPortfolio(portfolioData);
      setSummary(summaryData);
      setReviews(reviewsData);
      setReviewsOffset(10);
      setHasMoreReviews(reviewsData.length === 10);
    } catch (err) {
      setError(err.message);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReviews = async () => {
    try {
      setReviewsLoading(true);
      const newReviews = await reviewsApi.getPhotographerReviews(id, { 
        limit: 10, 
        offset: reviewsOffset 
      });
      
      setReviews(prev => [...prev, ...newReviews]);
      setReviewsOffset(prev => prev + 10);
      setHasMoreReviews(newReviews.length === 10);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setReviewsLoading(false);
    }
  };

  const pageVariants = reducedMotion ? fadeUp : fadeUp;

  if (loading) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading photographer profile...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadPhotographerData}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Try again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <motion.div 
        className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Photographer #{id}
        </h1>
        
        <AnimatePresence>
          {summary && (
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <RatingStars value={summary.avg_rating || 0} size="lg" readOnly />
                <span className="text-lg font-semibold text-gray-700">
                  {summary.avg_rating ? summary.avg_rating.toFixed(1) : '0.0'}
                </span>
              </div>
              <span className="text-gray-500">
                {summary.reviews_count} review{summary.reviews_count !== 1 ? 's' : ''}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Portfolio Section */}
      <motion.div 
        className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Portfolio</h2>
        <ImageGrid images={portfolio} />
      </motion.div>

      {/* Reviews Section */}
      <motion.div 
        className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Reviews</h2>
        <ReviewList 
          reviews={reviews}
          loading={reviewsLoading}
          onLoadMore={loadMoreReviews}
          hasMore={hasMoreReviews}
        />
      </motion.div>

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
