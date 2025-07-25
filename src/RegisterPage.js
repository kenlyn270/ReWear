// src/RegisterPage.js

import React, { useState } from 'react';
// Tambahkan 'getFirestore', 'doc', dan 'setDoc' dari Firestore
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; 
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // <-- State baru untuk role, defaultnya 'customer'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore(); // <-- Inisialisasi Firestore

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Buat user di Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Simpan data tambahan (termasuk role) ke Firestore
      // Nama dokumen di collection 'users' akan sama dengan UID user
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: role, // Ambil dari state 'role'
        createdAt: new Date()
      });
      
      // 3. Arahkan sesuai role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/shop'); // Customer ke halaman utama
      }

    } catch (err) {
      setError('Gagal mendaftar. Pastikan email valid dan password kuat.');
      console.error("Error registrasi:", err);
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="auth-container">
        <div className="auth-card">
        <h1 className="logo">EcoStyle</h1>
        <h2>Daftar Akun Admin</h2>
        <p className="auth-subtitle">Buat akun untuk mengelola dashboard perusahaan.</p>
        
        <form onSubmit={handleRegister} className="modal-form">
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
            
            <div className="form-group">
            <label htmlFor="role">Saya mendaftar sebagai</label>
            <select 
                id="role" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
            >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
            </select>
            </div>
            
            {error && <p className="error-message-ui">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="button-primary">
            {isLoading ? 'Mendaftarkan...' : 'Daftar'}
            </button>
        </form>
        
        {/*
            <Link to="/login"> -> Gunakan komponen Link yang sudah diimpor
        */}
        <p className="auth-switch">
            Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p> {/* <-- TAMBAHKAN INI */}

        </div>
    </div>
    );
}