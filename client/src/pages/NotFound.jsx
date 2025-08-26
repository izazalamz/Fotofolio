import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl text-gray-400 mb-6">📷</div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist. 
          It might have been moved or deleted.
        </p>
        <div className="space-y-4">
          <Link to="/">
            <Button size="lg" className="w-full">
              Go Home
            </Button>
          </Link>
          <Link to="/bookings">
            <Button variant="secondary" size="lg" className="w-full">
              Browse Jobs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
