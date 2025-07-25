import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; 
import { Link, useNavigate } from 'react-router-dom';
import { db } from './firebase'; 
import './App.css';

export default function RegisterPage() {
  const [fullName, setFullName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const auth = getAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        namaLengkap: fullName, 
        role: role,
        rewardPoints: 0, 
        createdAt: serverTimestamp() 
      });
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/'); 
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
        <h1 className="logo">ReWear</h1>
        <h2>Buat Akun Baru</h2>
        <p className="auth-subtitle">Daftar untuk mulai mendaur ulang dan berbelanja.</p>
        
        <form onSubmit={handleRegister} className="modal-form">
          <div className="form-group">
            <label htmlFor="fullName">Nama Lengkap</label>
            <input 
              type="text" 
              id="fullName" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        
        <p className="auth-switch">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>

      </div>
    </div>
  );
}