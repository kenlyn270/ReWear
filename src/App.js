import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute'; 
import LandingPage from './LandingPage'; // <-- Impor halaman baru
import CustomerHomePage from './CustomerHomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import './App.css';
import AdminDashboardPage from './AdminDashboardPage';

// // Ganti nama komponen Dashboard menjadi lebih spesifik
// function AdminDashboardPage() {
//   return (
//     <div>
//       <h1>Selamat Datang di Dashboard Admin!</h1>
//       <p>Ini adalah halaman khusus admin perusahaan.</p>
//     </div>
//   );
// }

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
          {/* Rute Utama: Halaman "Gerbang" */}
          <Route path="/" element={<LandingPage />} />

          {/* Rute untuk Customer */}
          <Route path="/shop" element={<CustomerHomePage />} />

          {/* Rute Autentikasi */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Rute Dashboard Admin yang Terproteksi */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Jika user membuka halaman lain, arahkan ke halaman gerbang */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}