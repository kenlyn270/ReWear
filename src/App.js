import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute'; 
import LandingPage from './LandingPage';
import CustomerHomePage from './CustomerHomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import './App.css';
import AdminDashboardPage from './AdminDashboardPage';

<Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute>
      <AdminDashboardPage />
    </ProtectedRoute>
  } 
/>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<CustomerHomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />          
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}