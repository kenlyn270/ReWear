import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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
  const db = getFirestore(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/shop'); 
        }
      } else {
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
        <h1 className="logo">ReWear</h1>
        <h2>Login</h2>
        <p className="auth-subtitle">Masuk untuk mengakses dashboard perusahaan.</p>
        
        <form onSubmit={handleLogin} className="modal-form">
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
            
            {}
            {error && <p className="error-message-ui">{error}</p>} {}
            
            <button type="submit" disabled={isLoading} className="button-primary">
            {isLoading ? 'Masuk...' : 'Login'}
            </button> {/* <-- UBAH INI */}

        </form>
        <p className="auth-switch">
            Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p> 
        
        </div>
    </div>
    );
}