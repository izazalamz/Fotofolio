import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BookingsList from './pages/BookingsList.jsx';
import BookingCreate from './pages/BookingCreate.jsx';
import Applications from './pages/Applications.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';
import Navbar from './components/Navbar.jsx';
import AuthGuard from './components/AuthGuard.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/bookings" element={<BookingsList />} />
            
            {/* Protected Routes */}
            <Route 
              path="/bookings/new" 
              element={
                <AuthGuard requiredRole="client">
                  <BookingCreate />
                </AuthGuard>
              } 
            />
            <Route 
              path="/bookings/:id/applications" 
              element={
                <AuthGuard requiredRole="client">
                  <Applications />
                </AuthGuard>
              } 
            />
            <Route 
              path="/me" 
              element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
