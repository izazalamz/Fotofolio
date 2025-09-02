import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioApi } from '../lib/api';
import ImageGrid from '../components/ImageGrid';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { fadeUp, shake, useReducedMotion } from '../lib/motion';

export default function PortfolioManager() {
  const reducedMotion = useReducedMotion();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    image: null,
    caption: ''
  });
  const [captionError, setCaptionError] = useState(false);

  // For now, we'll try to get photographer_id from localStorage or show a note
  const [photographerId, setPhotographerId] = useState(null);

  useEffect(() => {
    // Try to resolve photographer_id - this is a placeholder
    // In a real app, you'd have an endpoint to get current user's photographer_id
    const role = localStorage.getItem('role');
    if (role === 'photographer') {
      // For now, we'll proceed without photographer_id and let the server handle it
      setPhotographerId('current'); // Placeholder
    }
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Since we don't have photographer_id, we'll show a note
      // In a real app, you'd fetch the portfolio here
      setPortfolio([]);
    } catch (err) {
      setError(err.message);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleCaptionChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, caption: value }));
    
    // Trigger shake animation if caption exceeds limit
    if (value.length > 300) {
      setCaptionError(true);
      setTimeout(() => setCaptionError(false), 400);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      setToast({ message: 'Please select an image', type: 'error' });
      return;
    }

    try {
      setUploading(true);
      
      const uploadFormData = new FormData();
      uploadFormData.append('image', formData.image);
      if (formData.caption.trim()) {
        uploadFormData.append('caption', formData.caption.trim());
      }

      const newImage = await portfolioApi.uploadPortfolioImage(uploadFormData);
      
      setPortfolio(prev => [newImage, ...prev]);
      setFormData({ image: null, caption: '' });
      setToast({ message: 'Image uploaded successfully!', type: 'success' });
      
      // Reset file input
      e.target.reset();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setDeleting(imageId);
      await portfolioApi.deletePortfolioImage(imageId);
      
      setPortfolio(prev => prev.filter(img => img.id !== imageId));
      setToast({ message: 'Image deleted successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setDeleting(null);
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
        <p className="mt-4 text-gray-500">Loading portfolio...</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-6xl mx-auto"
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">My Portfolio</h1>
        <p className="text-gray-600">Manage your portfolio images and captions</p>
      </motion.div>

      {/* Upload Form */}
      <motion.div 
        className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Upload New Image</h2>
        
        {!photographerId && (
          <motion.div 
            className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-yellow-800 text-sm">
              Note: Couldn't resolve photographer ID. The server will validate your role and handle the upload.
            </p>
          </motion.div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG, or WebP format, maximum 5MB
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption (optional)
            </label>
            <motion.textarea
              value={formData.caption}
              onChange={handleCaptionChange}
              maxLength={300}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Describe your image..."
              animate={captionError ? "shake" : "initial"}
              variants={reducedMotion ? {} : shake}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.caption.length}/300 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={uploading || !formData.image}
            className="w-full sm:w-auto"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </form>
      </motion.div>

      {/* Portfolio Grid */}
      <motion.div 
        className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6 tracking-tight">Current Portfolio</h2>
        <ImageGrid 
          images={portfolio} 
          onDelete={handleDelete}
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
