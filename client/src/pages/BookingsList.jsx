import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Toast from '../components/Toast';

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    q: '',
    location: '',
    event_type: '',
    status: 'OPEN'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isApplying, setIsApplying] = useState(null);
  
  const role = localStorage.getItem('role');
  const isPhotographer = role === 'photographer';

  const eventTypes = [
    'Wedding', 'Portrait', 'Event', 'Commercial', 'Real Estate', 'Sports', 'Other'
  ];

  const statuses = [
    { value: 'OPEN', label: 'Open', variant: 'open' },
    { value: 'IN_REVIEW', label: 'In Review', variant: 'warning' },
    { value: 'LOCKED', label: 'Locked', variant: 'locked' },
    { value: 'COMPLETED', label: 'Completed', variant: 'success' },
    { value: 'CANCELLED', label: 'Cancelled', variant: 'danger' }
  ];

  async function loadBookings(p = 1) {
    setIsLoading(true);
    try {
      const params = { 
        page: p, 
        pageSize: 10,
        ...filters 
      };
      const data = await api.get('/bookings', { 
        params: new URLSearchParams(params) 
      });
      setBookings(data.rows);
      setTotal(data.total);
      setPage(data.page);
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBookings(1);
  }, [filters]);

  const handleApply = async (bookingId) => {
    try {
      setIsApplying(bookingId);
      await api.post(`/applications/${bookingId}/applications`);
      setToast({ message: 'Application submitted successfully!', type: 'success' });
      // Refresh the list to show updated application count
      loadBookings();
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setIsApplying(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusVariant = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.variant : 'default';
  };

  if (isLoading && page === 1) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Photography Jobs</h1>
          <p className="text-gray-600 mt-1">Find your next photography opportunity</p>
        </div>
        {role === 'client' && (
          <Link to="/bookings/new">
            <Button>Post a Job</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Location, event type..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.event_type}
              onChange={(e) => handleFilterChange('event_type', e.target.value)}
            >
              <option value="">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <Button 
              variant="secondary" 
              onClick={() => loadBookings(1)}
              className="w-full"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📷</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.event_type || 'Photography Job'}
                          </div>
                          <div className="text-sm text-gray-500">
                            <Badge variant="default" size="sm">
                              {formatDate(booking.event_date)}
                            </Badge>
                          </div>
                          {booking.notes && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {booking.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {booking.location || 'Location not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(booking.status)}>
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link to={`/bookings/${booking.booking_id}`}>
                            <Button variant="secondary" size="sm">View</Button>
                          </Link>
                          {isPhotographer && booking.status === 'OPEN' && (
                            <Button
                              size="sm"
                              disabled={isApplying === booking.booking_id}
                              onClick={() => handleApply(booking.booking_id)}
                            >
                              {isApplying === booking.booking_id ? 'Applying...' : 'Apply'}
                            </Button>
                          )}
                          {role === 'client' && booking.status === 'OPEN' && (
                            <Link to={`/bookings/${booking.booking_id}/applications`}>
                              <Button variant="success" size="sm">Applications</Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {total > 10 && (
              <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => loadBookings(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={(page * 10) >= total}
                    onClick={() => loadBookings(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
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
