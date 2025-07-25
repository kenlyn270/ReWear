// src/LandingPage.js - Versi Baru

import React from 'react';
import { Link } from 'react-router-dom';
import './App.css'; // Kita tetap pakai CSS yang sudah ada

export default function LandingPage() {
  return (
    // Kita gunakan class .hero-section yang sudah ada di CSS-mu
    <section className="hero-section" style={{ height: '100vh', borderRadius: '0' }}>
      <div className="hero-image-container">
        {/* Ini adalah gambar yang sama dari halaman customer-mu */}
        <img src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop" alt="Interior toko pakaian" />
      </div>
      <div className="hero-content">
        <h1 className="logo" style={{ fontSize: '3.5rem', color: 'white' }}>EcoStyle</h1>
        <h2 className="shadow-text" style={{ fontSize: '3rem', marginTop: '1rem' }}>Selamat Datang.</h2>
        <p className="shadow-text" style={{ maxWidth: '45rem' }}>
          Platform fashion berkelanjutan untuk admin dan customer. Masuk atau daftar untuk melanjutkan perjalanan Anda bersama kami.
        </p>
        
        {/* Bagian baru untuk tombol Login dan Register */}
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