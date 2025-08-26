import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Button from '../components/Button';
import Toast from '../components/Toast';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({});
  const [myBookings, setMyBookings] = useState([]);
  
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');

  useEffect(() => {
    loadProfile();
    if (role === 'client') {
      loadMyBookings();
    }
  }, [role]);

  const loadProfile = async () => {
    try {
      // For now, we'll create a mock profile since the backend doesn't have profile endpoints
      const mockProfile = {
        name,
        role,
        phone: '',
        specialization: '',
        location: '',
        profile_image_url: ''
      };
      setProfile(mockProfile);
      setFormData(mockProfile);
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyBookings = async () => {
    try {
      const data = await api.get('/bookings');
      setMyBookings(data.rows || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Mock save - in real app this would call an API
      setProfile(formData);
      setIsEditing(false);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <Button
          variant={isEditing ? "success" : "secondary"}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={role === 'client' ? 'Client' : 'Photographer'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                />
              </div>

              {role === 'photographer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g., Wedding, Portrait, Commercial"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g., New York, NY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium">{role === 'client' ? 'Client' : 'Photographer'}</span>
              </div>
              {role === 'client' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs Posted:</span>
                  <span className="font-medium">{myBookings.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="secondary" className="w-full justify-center">
                Browse Jobs
              </Button>
              {role === 'client' && (
                <Button className="w-full justify-center">
                  Post New Job
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* My Bookings (Client Only) */}
      {role === 'client' && myBookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">My Bookings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {myBookings.slice(0, 5).map((booking) => (
                  <tr key={booking.booking_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.event_type || 'Photography Job'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.location || 'Location not specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.event_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'LOCKED' ? 'bg-purple-100 text-purple-800' :
                        booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="secondary" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
