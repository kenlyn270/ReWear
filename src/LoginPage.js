// src/LoginPage.js

import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// Tambahkan 'getFirestore', 'doc', dan 'getDoc'
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore(); // <-- Inisialisasi Firestore

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Login dengan Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Ambil data user dari Firestore menggunakan UID
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        // 3. Arahkan berdasarkan role dari data Firestore
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/shop'); // Customer ke halaman utama
        }
      } else {
        // Ini kasus jarang terjadi, tapi bagus untuk penanganan error
        throw new Error("Data pengguna tidak ditemukan di database.");
      }
      
    } catch (err) {
      setError('Email atau password salah. Coba lagi.');
      console.error("Error login:", err);
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="auth-container">
        <div className="auth-card">
        <h1 className="logo">EcoStyle</h1>
        <h2>Login Admin</h2>
        <p className="auth-subtitle">Masuk untuk mengakses dashboard perusahaan.</p>
        
        {/* onSubmit={handleLogin} -> Hubungkan form dengan fungsi handleLogin
        */}
        <form onSubmit={handleLogin} className="modal-form"> {/* <-- TAMBAHKAN INI */}
            <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input 
                type="email" 
                id="email" 
                value={email} // <-- Hubungkan value dengan state email
                onChange={(e) => setEmail(e.target.value)} // <-- Hubungkan onChange dengan setEmail
                required 
            />
            </div>
            <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
                type="password" 
                id="password" 
                value={password} // <-- Hubungkan value dengan state password
                onChange={(e) => setPassword(e.target.value)} // <-- Hubungkan onChange dengan setPassword
                required 
            />
            </div>
            
            {/* {error && ...} -> Tampilkan pesan error jika ada
            */}
            {error && <p className="error-message-ui">{error}</p>} {/* <-- TAMBAHKAN INI */}
            
            {/*
            disabled={isLoading} -> Tombol tidak bisa diklik saat loading
            {isLoading ? ...} -> Ubah teks tombol saat loading
            */}
            <button type="submit" disabled={isLoading} className="button-primary">
            {isLoading ? 'Masuk...' : 'Login'}
            </button> {/* <-- UBAH INI */}

        </form>
        
        {/*
            <Link to="/register"> -> Gunakan komponen Link yang sudah diimpor
        */}
        <p className="auth-switch">
            Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p> {/* <-- TAMBAHKAN INI */}
        
        </div>
    </div>
    );
}