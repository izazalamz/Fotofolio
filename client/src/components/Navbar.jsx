import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from './Button';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  function logout() {
    localStorage.clear();
    navigate('/');
    setShowUserMenu(false);
  }

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', public: true },
    { path: '/bookings', label: 'Browse Jobs', public: true },
    { path: '/bookings/new', label: 'Post Job', public: false, role: 'client' },
    { path: '/me', label: 'My Profile', public: false }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Fotofolio</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              if (link.public || (token && (!link.role || link.role === role))) {
                return (
                  <motion.div
                    key={link.path}
                    className="relative"
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                  >
                    <Link
                      to={link.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(link.path)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                    {isActive(link.path) && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        layoutId="activeIndicator"
                        initial={false}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      />
                    )}
                  </motion.div>
                );
              }
              return null;
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {!token ? (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span>{name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{name}</div>
                      <div className="text-gray-500 capitalize">{role}</div>
                    </div>
                    <Link
                      to="/me"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                    {role === 'client' && (
                      <Link
                        to="/bookings/new"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Post New Job
                      </Link>
                    )}
                    {role === 'photographer' && (
                      <Link
                        to="/dashboard/portfolio"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Portfolio
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => {
            if (link.public || (token && (!link.role || link.role === role))) {
              return (
                <motion.div
                  key={link.path}
                  whileHover={{ x: 4 }}
                  whileTap={{ x: 0 }}
                >
                  <Link
                    to={link.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(link.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              );
            }
            return null;
          })}
          {token && role === 'photographer' && (
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ x: 0 }}
            >
              <Link
                to="/dashboard/portfolio"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/dashboard/portfolio')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                My Portfolio
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}
