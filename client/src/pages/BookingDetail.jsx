import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { paymentsApi, reviewsApi } from '../lib/api';
import Button from '../components/Button';
import RatingStars from '../components/RatingStars';
import Toast from '../components/Toast';
import { fadeUp, crossfade, useReducedMotion } from '../lib/motion';

export default function BookingDetail() {
  const reducedMotion = useReducedMotion();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    rating: 0,
    comment: ''
  });

  useEffect(() => {
    loadBookingData();
  }, [id]);

  const loadBookingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll create a mock booking since we don't have the actual API
      // In a real app, you'd fetch from your existing bookings API
      const mockBooking = {
        id: parseInt(id),
        status: 'LOCKED',
        photographer_id: 1,
        event_date: '2025-09-15',
        location: 'Central Park, NY',
        event_type: 'Wedding'
      };
      
      setBooking(mockBooking);
      
      // Load payment and review data
      const [paymentData, reviewData] = await Promise.all([
        paymentsApi.getPayment(id),
        reviewsApi.getBookingReview(id)
      ]);
      
      setPayment(paymentData);
      setReview(reviewData);
    } catch (err) {
      setError(err.message);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    try {
      setPaying(true);
      const amount = parseFloat(formData.amount) || 0;
      
      const paymentResult = await paymentsApi.payBooking(id, amount);
      setPayment(paymentResult);
      setFormData(prev => ({ ...prev, amount: '' }));
      setToast({ message: 'Payment successful!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setPaying(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rating) {
      setToast({ message: 'Please select a rating', type: 'error' });
      return;
    }

    try {
      setSubmittingReview(true);
      
      const reviewResult = await reviewsApi.postReview(id, {
        rating: formData.rating,
        comment: formData.comment.trim()
      });
      
      setReview({ exists: true, review: reviewResult });
      setFormData(prev => ({ ...prev, rating: 0, comment: '' }));
      setToast({ message: 'Review submitted successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const pageVariants = reducedMotion ? fadeUp : fadeUp;
  const isPaid = payment && payment.status === 'PAID';
  const canReview = isPaid && !review?.exists;

  if (loading) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading booking details...</p>
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
          onClick={loadBookingData}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Try again
        </button>
      </motion.div>
    );
  }

  if (!booking) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-gray-600">Booking not found</p>
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
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Booking #{id}</h1>
        <p className="text-gray-600">Manage your booking details</p>
      </motion.div>

      {/* Status Section */}
      <motion.div 
        className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              booking.status === 'LOCKED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {booking.status}
            </span>
          </div>
          
          {booking.photographer_id && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Assigned Photographer:</span>
              <Link 
                to={`/photographers/${booking.photographer_id}`}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                View Profile
              </Link>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Event Date:</span>
            <span className="text-gray-900">{new Date(booking.event_date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="text-gray-900">{booking.location}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Event Type:</span>
            <span className="text-gray-900">{booking.event_type}</span>
          </div>
        </div>
      </motion.div>

      {/* Payment Section */}
      <motion.div 
        className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Payment</h2>
        
        <AnimatePresence mode="wait">
          {isPaid ? (
            <motion.div 
              key="paid"
              className="flex items-center gap-3"
              variants={crossfade}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                PAID
              </span>
              <span className="text-gray-600">
                Amount: ${payment.amount}
              </span>
              <span className="text-gray-500 text-sm">
                Paid on {new Date(payment.payment_date).toLocaleDateString()}
              </span>
            </motion.div>
          ) : (
            <motion.form 
              key="payment-form"
              onSubmit={handlePayment} 
              className="space-y-4"
              variants={crossfade}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This is a mock payment - no actual charges will be made
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={paying}
                className="w-full sm:w-auto"
              >
                {paying ? 'Processing...' : 'Pay Now'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Review Section */}
      <motion.div 
        className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Review</h2>
        
        <AnimatePresence mode="wait">
          {review?.exists ? (
            <motion.div 
              key="review-display"
              className="bg-gray-50 rounded-lg p-4"
              variants={crossfade}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="flex items-center gap-3 mb-3">
                <RatingStars value={review.review.rating} size="md" readOnly />
                <span className="text-gray-600">
                  {new Date(review.review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.review.comment && (
                <p className="text-gray-700">{review.review.comment}</p>
              )}
            </motion.div>
          ) : canReview ? (
            <motion.form 
              key="review-form"
              onSubmit={handleReviewSubmit} 
              className="space-y-4"
              variants={crossfade}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <RatingStars 
                  value={formData.rating} 
                  onChange={handleRatingChange}
                  readOnly={false}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (optional)
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  maxLength={1000}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Share your experience..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.comment.length}/1000 characters
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={submittingReview || !formData.rating}
                className="w-full sm:w-auto"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </motion.form>
          ) : (
            <motion.div 
              key="review-placeholder"
              className="text-center py-4 text-gray-500"
              variants={crossfade}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {!isPaid ? (
                <p>Complete payment to leave a review</p>
              ) : (
                <p>You have already submitted a review for this booking</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
