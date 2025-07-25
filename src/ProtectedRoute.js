// src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Jika tidak ada user yang login, arahkan ke halaman login
    return <Navigate to="/login" />;
  }

  // Jika ada user yang login, tampilkan halaman yang diminta (children)
  return children;
}