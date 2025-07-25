import React from 'react';
import { Link } from 'react-router-dom';
import './App.css'; 

export default function LandingPage() {
  return (
    <section className="hero-section" style={{ height: '100vh', borderRadius: '0' }}>
      <div className="hero-image-container">
        <img src="https://i.pinimg.com/736x/a4/d0/bd/a4d0bdbdc18a0fc2588013d673e67e61.jpg" alt="Interior toko pakaian" />
      </div>
      <div className="hero-content">
        <h1 className="logo" style={{ fontSize: '3.5rem', color: 'white', textAlign: 'center' }}>
          ReWear
        </h1>
        <h2 className="shadow-text" style={{ fontSize: '3rem', marginTop: '1rem', textAlign: 'center' }}>
          Selamat Datang.
        </h2>
        <p className="shadow-text" style={{ maxWidth: '45rem', textAlign: 'center' }}>
          Platform fashion berkelanjutan untuk admin dan customer. Masuk atau daftar untuk melanjutkan perjalanan Anda bersama kami.
        </p>
        
        <div className="landing-actions-hero">
          <Link to="/login" className="cta-button">
            Masuk (Login)
          </Link>
          <Link to="/register" className="cta-button-secondary">
            Daftar (Register)
          </Link>
        </div>
      </div>
    </section>
  );
}