import React, { useState, useEffect } from 'react';
import './App.css'; // Penting: Import file CSS
import AIChecker from './AIChecker'; // <-- Tambahkan import untuk komponen AI
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "./firebase";


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
// const IconPackageCheck = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="success-icon">
//     <path d="m16 16 2 2 4-4"></path><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><path d="M16.5 9.4 7.55 4.24"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line>
//   </svg>
// );
// const IconInfo = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="info-icon">
//     <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
//   </svg>
// );
const IconTrash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

// --- Komponen Utama Aplikasi ---
export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- STATE BARU UNTUK KERANJANG & NOTIFIKASI ---
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Oops, gagal memuat produk. Silakan coba muat ulang halaman nanti.");
        // Di sini kamu bisa menambahkan state untuk menampilkan pesan error di UI jika perlu
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  // --- FUNGSI BARU UNTUK MENGELOLA KERANJANG & NOTIFIKASI ---
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- REVISI 1: Logika "Tambah ke Keranjang" ---
  const handleAddToCart = (productToAdd) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productToAdd.id);
      if (existingItem) {
        // Jika barang sudah ada, tambah quantity-nya
        return prevItems.map(item =>
          item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Jika barang baru, tambahkan ke keranjang dengan quantity 1 dan status terpilih (checked)
      return [...prevItems, { ...productToAdd, quantity: 1, selected: true }];
    });
    setNotification(`${productToAdd.name} telah ditambahkan ke keranjang!`);
  };

  // --- REVISI 3: Logika "Hapus dari Keranjang" ---
  const handleRemoveFromCart = (productIdToRemove) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productIdToRemove));
  };

  // --- FUNGSI BARU: Logika "Ubah Jumlah Barang" ---
  const handleUpdateQuantity = (productId, amount) => {
    setCartItems(prevItems =>
        prevItems.map(item =>
            item.id === productId
                ? { ...item, quantity: Math.max(1, item.quantity + amount) } // Pastikan jumlah tidak kurang dari 1
                : item
        )
    );
  };

  // --- REVISI 2: Logika "Checklist" ---
  const handleToggleSelectItem = (productIdToToggle) => {
      setCartItems(prevItems =>
        prevItems.map(item =>
            item.id === productIdToToggle ? { ...item, selected: !item.selected } : item
        )
      );
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Hitung total item untuk badge di ikon keranjang
  const totalCartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  console.log("INI DATA PRODUK YG DITERIMA KODE:", products);
  return (
    <div className="app-container">
      <Header cartItemCount={totalCartQuantity} onCartClick={toggleCart} />
      <main>
        <HeroSection onSendClick={handleOpenModal} />
        <section className="catalog-section">
          <h2>Produk Hasil Daur Ulang</h2>
          <p>Beli produk keren sambil membantu bumi.</p>
          
          {/* ===== PASTIKAN BAGIAN INI ADA ===== */}
          {error ? (
            <div className="error-ui-message">
              {/* Di sini variabel 'error' dipakai untuk ditampilkan */}
              <p>{error}</p> 
            </div>
          ) : (
            <ProductCatalog 
              products={products} 
              isLoading={isLoading} 
              onAddToCart={handleAddToCart} 
            />
          )}
          {/* ======================================= */}

        </section>
      </main>
      <Footer />
      {isModalOpen && <SubmissionModal onClose={handleCloseModal} />}
      {isCartOpen && <ShoppingCart items={cartItems} onClose={toggleCart} onRemove={handleRemoveFromCart} onToggleSelect={handleToggleSelectItem} onUpdateQuantity={handleUpdateQuantity} />}
      {notification && <Notification message={notification} />}
    </div>
  );
}

// --- Komponen-komponen Pendukung ---
function Header({ cartItemCount, onCartClick }) {
  const navItems = ['Woman', 'Men', 'Kids', 'Baby'];
  return (
    <header className="app-header">
      <nav className="header-nav">
        <h1 className="logo">EcoStyle</h1>
        <div className="nav-links">
          {navItems.map(item => <a key={item} href="/#">{item}</a>)}
          <a href="/#" className="active">Recycle</a>
          <button onClick={onCartClick} className="cart-button">
            <IconShoppingCart />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>
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

function ProductCatalog({ products, isLoading, onAddToCart }) {
  if (isLoading) {
    return (
      <div className="product-grid">
        {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }
  return (
    <div className="product-grid">
      {products.map(product => <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />)}
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>Rp {product.price.toLocaleString('id-ID')}</p>
        <button onClick={() => onAddToCart(product)} className="add-to-cart-button">
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
  const [aiResult, setAiResult] = useState(null); // state baru simpan hasil AI

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.target);

    // Gabung data form + hasil AI
    const dataToSave = {
      namaLengkap: formData.get("fullName"),
      alamatPenjemputan: formData.get("address"),
      jenisBarang: formData.get("itemType"),
      deskripsiKondisi: formData.get("itemDescription"),
      createdAt: serverTimestamp(),
      status: "pending",
      aiStatus: aiResult?.status || null,
      aiKategori: aiResult?.kategori || null,
      aiSaranUpcycle: aiResult?.saran_upcycle || []
    };

    try {
      await addDoc(collection(db, "recycles"), dataToSave);
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error simpan data:", error);
      alert("Gagal menyimpan data, coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-button">✕</button>

        {submitSuccess ? (
          <div className="modal-success-view">
            <h2>Terima Kasih!</h2>
            <p>Formulir pengirimanmu telah kami terima.</p>
            <button onClick={onClose} className="button-primary">Tutup</button>
          </div>
        ) : (
          <>
            <h2>Kirim Barang Bekasmu</h2>
            <p className="modal-subtitle">Isi detail + cek kondisi barangmu dengan AI.</p>

            {/* 🔍 Tambahin AI Checker di atas form */}
            <AIChecker onCheckComplete={setAiResult} />

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
                <textarea id="itemDescription" name="itemDescription" rows="3" required></textarea>
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

export {SubmissionModal};


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

function Notification({ message }) {
  return (
    <div className="notification-popup">
      {message}
    </div>
  );
}

// --- REVISI KOMPONEN KERANJANG ---
function ShoppingCart({ items, onClose, onRemove, onToggleSelect, onUpdateQuantity }) {
    // --- REVISI 2: Hitung total harga hanya untuk item yang dipilih ---
    const totalPrice = items
        .filter(item => item.selected)
        .reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <div className="cart-overlay" onClick={onClose}>
            <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
                <div className="cart-header">
                    <h3>Keranjang Belanja</h3>
                    <button onClick={onClose} className="modal-close-button"><IconX /></button>
                </div>
                <div className="cart-items">
                    {items.length === 0 ? (
                        <p className="cart-empty">Keranjangmu masih kosong.</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="cart-item">
                                <input 
                                    type="checkbox" 
                                    className="cart-item-checkbox" 
                                    checked={item.selected}
                                    onChange={() => onToggleSelect(item.id)}
                                />
                                <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                                <div className="cart-item-info">
                                    <h4>{item.name}</h4>
                                    <p>Rp {item.price.toLocaleString('id-ID')}</p>
                                    {/* --- REVISI: Penyesuai Jumlah Barang --- */}
                                    <div className="quantity-adjuster">
                                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="quantity-btn">-</button>
                                        <span className="quantity-display">{item.quantity}</span>
                                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="quantity-btn">+</button>
                                    </div>
                                </div>
                                <button onClick={() => onRemove(item.id)} className="cart-item-remove"><IconTrash /></button>
                            </div>
                        ))
                    )}
                </div>
                {items.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                        </div>
                        <button className="button-primary">Checkout</button>
                    </div>
                )}
            </div>
        </div>
    );
}
