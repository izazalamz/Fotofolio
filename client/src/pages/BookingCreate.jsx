import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Button from '../components/Button';
import Toast from '../components/Toast';

export default function BookingCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    event_date: '',
    location: '',
    event_type: '',
    notes: '',
    amount: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const eventTypes = [
    'Wedding', 'Portrait', 'Event', 'Commercial', 'Real Estate', 'Sports', 'Other'
  ];

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    const selectedDate = new Date(formData.event_date);
    
    if (!formData.event_date) {
      newErrors.event_date = 'Event date is required';
    } else if (selectedDate < today) {
      newErrors.event_date = 'Event date must be in the future';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.event_type) {
      newErrors.event_type = 'Event type is required';
    }
    
    if (formData.amount && isNaN(formData.amount)) {
      newErrors.amount = 'Amount must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const data = await api.post('/bookings', {
        event_date: formData.event_date,
        location: formData.location,
        event_type: formData.event_type,
        notes: formData.notes
      });
      
      setToast({ 
        message: `Job posted successfully! Booking #${data.booking_id}`, 
        type: 'success' 
      });
      
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post a Photography Job</h1>
        <p className="text-gray-600 mt-2">
          Describe your photography needs and find the perfect photographer
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                id="event_date"
                name="event_date"
                type="date"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.event_date ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.event_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.event_date && <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>}
            </div>

            <div>
              <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                id="event_type"
                name="event_type"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.event_type ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.event_type}
                onChange={handleChange}
              >
                <option value="">Select event type</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.event_type && <p className="mt-1 text-sm text-red-600">{errors.event_type}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              placeholder="e.g., Central Park, New York, NY"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.location}
              onChange={handleChange}
            />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Budget (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                id="amount"
                name="amount"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Describe your photography needs, style preferences, special requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Posting Job...' : 'Post Job'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/bookings')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
