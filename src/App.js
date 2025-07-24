import React, { useState, useEffect } from 'react';
import './App.css'; // Penting: Import file CSS

// --- Komponen Ikon SVG ---
const IconShoppingCart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);
const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const IconPackageCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="success-icon">
    <path d="m16 16 2 2 4-4"></path><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><path d="M16.5 9.4 7.55 4.24"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line>
  </svg>
);
const IconInfo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="info-icon">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Komponen Utama Aplikasi ---
export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockProducts = [
      { id: 1, name: 'Tote Bag Rajut Bumi', price: 150000, imageUrl: 'https://placehold.co/600x400/D2B48C/8B4513?text=Tote+Bag' },
      { id: 2, name: 'Dompet Kulit Vegan', price: 75000, imageUrl: 'https://placehold.co/600x400/BC8F8F/8B4513?text=Dompet' },
      { id: 3, name: 'Kemeja Linen Natural', price: 180000, imageUrl: 'https://placehold.co/600x400/F5DEB3/8B4513?text=Kemeja' },
      { id: 4, name: 'Sandal Jerami Anyam', price: 120000, imageUrl: 'https://placehold.co/600x400/CD853F/8B4513?text=Sandal' },
    ];
    setTimeout(() => {
      setProducts(mockProducts);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="app-container">
      <Header />
      <main>
        <HeroSection onSendClick={handleOpenModal} />
        <section className="catalog-section">
          <h2>Produk Hasil Daur Ulang</h2>
          <p>Beli produk keren sambil membantu bumi.</p>
          <ProductCatalog products={products} isLoading={isLoading} />
        </section>
      </main>
      <Footer />
      {isModalOpen && <SubmissionModal onClose={handleCloseModal} />}
    </div>
  );
}

// --- Komponen-komponen Pendukung ---
function Header() {
  const navItems = ['Woman', 'Men', 'Kids', 'Baby'];
  return (
    <header className="app-header">
      <nav className="header-nav">
        <h1 className="logo">EcoStyle</h1>
        <div className="nav-links">
          {navItems.map(item => <a key={item} href="/#">{item}</a>)}
          <a href="/#" className="active">Recycle</a>
        </div>
        <button className="mobile-menu-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </nav>
    </header>
  );
}

function HeroSection({ onSendClick }) {
  return (
    <section className="hero-section">
      <div className="hero-image-container">
        <img src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop" alt="Recycling clothes" />
      </div>
      <div className="hero-content">
        <h2 className="shadow-text">Beri Pakaianmu Kesempatan Kedua.</h2>
        <p className="shadow-text">Setiap helai kain berharga. Kirimkan pakaian bekas layak pakaimu dan jadilah bagian dari perubahan.</p>
        <button onClick={onSendClick} className="cta-button">
          <IconSend /> Kirim Barang Bekasmu
        </button>
      </div>
    </section>
  );
}

function ProductCatalog({ products, isLoading }) {
  if (isLoading) {
    return (
      <div className="product-grid">
        {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }
  return (
    <div className="product-grid">
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>Rp {product.price.toLocaleString('id-ID')}</p>
        <button className="add-to-cart-button">
          <IconShoppingCart /> Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="product-card skeleton">
      <div className="skeleton-image"></div>
      <div className="product-info">
        <div className="skeleton-text-h3"></div>
        <div className="skeleton-text-p"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
}

function SubmissionModal({ onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-button">
          <IconX />
        </button>
        {submitSuccess ? (
          <div className="modal-success-view">
            <IconPackageCheck />
            <h2>Terima Kasih!</h2>
            <p>Formulir pengirimanmu telah kami terima. Tim kami akan segera meninjau dan menghubungimu untuk proses selanjutnya.</p>
            <button onClick={onClose} className="button-primary">Tutup</button>
          </div>
        ) : (
          <>
            <h2>Kirim Barang Bekasmu</h2>
            <p className="modal-subtitle">Isi detail di bawah ini untuk memulai proses daur ulang.</p>
            <div className="info-box">
              <IconInfo />
              <div>
                <h4>Kriteria Penukaran Barang</h4>
                <ul>
                  <li>Pakaian harus bersih dan tidak berbau.</li>
                  <li>Tidak ada sobekan besar atau noda permanen.</li>
                  <li>Semua jenis pakaian dewasa dan anak-anak diterima.</li>
                  <li>Minimal pengiriman 3 potong pakaian.</li>
                </ul>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="fullName">Nama Lengkap</label>
                <input type="text" id="fullName" name="fullName" required />
              </div>
              <div className="form-group">
                <label htmlFor="address">Alamat Penjemputan</label>
                <textarea id="address" name="address" rows="3" required></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="itemType">Jenis Barang</label>
                <select id="itemType" name="itemType" required>
                  <option>Kemeja</option><option>Celana</option><option>Gaun</option><option>Jaket</option><option>Lainnya</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="itemDescription">Deskripsi/Kondisi Barang</label>
                <textarea id="itemDescription" name="itemDescription" rows="3" placeholder="Contoh: Kemeja katun biru, sedikit pudar..." required></textarea>
              </div>
              <button type="submit" disabled={isSubmitting} className="button-primary">
                {isSubmitting ? 'Mengirim...' : 'Kirim Detail Barang'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-column">
          <h3>EcoStyle</h3>
          <p>Mendukung fashion yang berkelanjutan untuk masa depan bumi yang lebih baik.</p>
        </div>
        <div className="footer-column">
          <h4>Belanja</h4>
          <ul>
            <li><a href="/#">Woman</a></li><li><a href="/#">Men</a></li><li><a href="/#">Kids</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Tentang Kami</h4>
          <ul>
            <li><a href="/#">Visi & Misi</a></li><li><a href="/#">Program Daur Ulang</a></li><li><a href="/#">Karir</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Ikuti Kami</h4>
          <div className="social-links">
            <a href="/#">Facebook</a><a href="/#">Instagram</a><a href="/#">Twitter</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 EcoStyle Indonesia. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
