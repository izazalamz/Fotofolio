import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function AuthGuard({ children, requiredRole = null }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
