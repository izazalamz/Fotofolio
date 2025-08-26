import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Fotofolio
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect talented photographers with clients who need professional photography services. 
          Simple, secure, and seamless hiring platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/bookings">
            <Button size="lg" className="w-full sm:w-auto">
              Browse Jobs
            </Button>
          </Link>
          <Link to="/bookings/new">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Post a Job
            </Button>
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Post a Job</h3>
            <p className="text-gray-600">
              Clients describe their photography needs, set event details, and budget.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Photographers Apply</h3>
            <p className="text-gray-600">
              Talented photographers submit applications with portfolios and proposals.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Select & Hire</h3>
            <p className="text-gray-600">
              Review applications, compare portfolios, and select the perfect photographer.
            </p>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          For Everyone
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📸</span>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Photographers</h3>
            <p className="text-gray-600 mb-6">
              Showcase your portfolio, apply to jobs that match your skills, and grow your business.
            </p>
            <Link to="/register">
              <Button>Join as Photographer</Button>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Clients</h3>
            <p className="text-gray-600 mb-6">
              Find talented photographers, compare portfolios, and hire the perfect match for your event.
            </p>
            <Link to="/register">
              <Button>Post a Job</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Fotofolio</h3>
          <p className="text-gray-400 mb-6">
            Connecting photographers with clients since 2024
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/bookings" className="text-gray-400 hover:text-white transition-colors">
              Browse Jobs
            </Link>
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
