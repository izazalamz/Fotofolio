import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

export default function Applications() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    loadApplications();
  }, [bookingId]);

  async function loadApplications() {
    try {
      setIsLoading(true);
      const data = await api.get(`/applications/${bookingId}/applications`);
      setApplications(data);
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectApplication(applicationId) {
    try {
      await api.post(`/select/${bookingId}/select`, {
        application_id: applicationId
      });
      
      setToast({ message: 'Photographer selected successfully!', type: 'success' });
      setShowSelectModal(false);
      setSelectedApplication(null);
      
      // Reload applications to show updated status
      await loadApplications();
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-2">
            Review photographer applications for this booking
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Back to Bookings
        </Button>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">
              Applications will appear here once photographers start applying to your job.
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {applications.length} Application{applications.length !== 1 ? 's' : ''}
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {applications.map((app) => (
                <div key={app.application_id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {app.photographer_name}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>Portfolio: {app.portfolio_count} items</span>
                            <span>Applied: {new Date(app.application_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={
                              app.status === 'PENDING' ? 'warning' : 
                              app.status === 'ACCEPTED' ? 'success' : 
                              app.status === 'REJECTED' ? 'danger' : 'default'
                            }
                          >
                            {app.status}
                          </Badge>
                          {app.status === 'PENDING' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(app);
                                setShowSelectModal(true);
                              }}
                            >
                              Select
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Select Photographer Modal */}
      <Modal
        isOpen={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        title="Select Photographer"
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowSelectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => handleSelectApplication(selectedApplication?.application_id)}
            >
              Confirm Selection
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to select <strong>{selectedApplication?.photographer_name}</strong> for this job?
        </p>
        <p className="text-gray-600 mt-2">
          This will lock the booking and reject all other applications. This action cannot be undone.
        </p>
      </Modal>

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
