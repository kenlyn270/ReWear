import React, { useState, useEffect } from 'react';
import './App.css'; // Penting: Import file CSS
import AIChecker from './AIChecker'; // <-- Tambahkan import untuk komponen AI
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "./firebase";


// --- Komponen Ikon SVG ---
const IconShoppingCart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);
const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const IconTrash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

// --- Komponen Utama Aplikasi ---
export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddToCart = (productToAdd) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productToAdd.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...productToAdd, quantity: 1, selected: true }];
    });
    setNotification(`${productToAdd.name} telah ditambahkan ke keranjang!`);
  };

  const handleRemoveFromCart = (productIdToRemove) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productIdToRemove));
  };

  const handleUpdateQuantity = (productId, amount) => {
    setCartItems(prevItems =>
        prevItems.map(item =>
            item.id === productId
                ? { ...item, quantity: Math.max(1, item.quantity + amount) }
                : item
        )
    );
  };

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

  const totalCartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="app-container">
      <Header cartItemCount={totalCartQuantity} onCartClick={toggleCart} />
      <main>
        <HeroSection onSendClick={handleOpenModal} />
        <section className="catalog-section">
          <h2>Produk Hasil Daur Ulang</h2>
          <p>Beli produk keren sambil membantu bumi.</p>
          
          {error ? (
            <div className="error-ui-message">
              <p>{error}</p> 
            </div>
          ) : (
            <ProductCatalog 
              products={products} 
              isLoading={isLoading} 
              onAddToCart={handleAddToCart} 
            />
          )}
        </section>
      </main>
      <Footer />
      
      {isModalOpen && <SubmissionModal onClose={handleCloseModal} setNotification={setNotification} />}

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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
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

function SubmissionModal({ onClose, setNotification }) {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    itemType: 'Kemeja',
    itemDescription: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  useEffect(() => {
    // DEBUG: Console log untuk melihat data
    console.log("VALIDASI DIJALANKAN, DATA SAAT INI:", { 
      formData, 
      aiResult,
      allFieldsFilled: Object.values(formData).every(value => value.trim() !== ''),
      aiStatus: aiResult?.status
    });

    const allFieldsFilled = Object.values(formData).every(value => value.trim() !== '');
    
    // PERBAIKAN: Periksa berbagai kemungkinan struktur aiResult
    const isAiCheckSuccessful = aiResult && (
      aiResult.status === 'diterima' || 
      aiResult.hasil === 'diterima' || 
      aiResult.success === true ||
      aiResult.valid === true ||
      aiResult.accepted === true ||
      aiResult.isValid === true
    );

    console.log("AI Check Result:", {
      aiResult,
      isAiCheckSuccessful,
      aiResultKeys: aiResult ? Object.keys(aiResult) : 'null'
    });

    setIsFormValid(allFieldsFilled && isAiCheckSuccessful);

  }, [formData, aiResult]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("SUBMIT TRIGGERED:", { isFormValid, isSubmitting, aiResult });

    if (!isFormValid) {
      setNotification("❌ Pastikan semua kolom terisi dan foto pakaian valid.");
      return;
    }
    
    setIsSubmitting(true);

    const dataToSave = {
      namaLengkap: formData.fullName,
      alamatPenjemputan: formData.address,
      jenisBarang: formData.itemType,
      deskripsiKondisi: formData.itemDescription,
      createdAt: serverTimestamp(),
      status: "pending",
      aiStatus: aiResult?.status || aiResult?.hasil || null,
      aiKategori: aiResult?.kategori || aiResult?.category || null,
      aiSaranUpcycle: aiResult?.saran_upcycle || aiResult?.suggestions || []
    };

    try {
      await addDoc(collection(db, "recycles"), dataToSave);
      setNotification("✅ Terima kasih! Formulir pengirimanmu telah kami terima.");
      onClose();
    } catch (error) {
      console.error("Error simpan data:", error);
      setNotification("❌ Gagal menyimpan data, coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-button">✕</button>
        <>
          <h2>Kirim Barang Bekasmu</h2>
          <p className="modal-subtitle">Isi detail di bawah ini lalu cek kondisi barangmu dengan AI.</p>
          
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="fullName">Nama Lengkap</label>
              <input 
                type="text" id="fullName" name="fullName" required 
                value={formData.fullName} onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Alamat Penjemputan</label>
              <textarea 
                id="address" name="address" rows="3" required
                value={formData.address} onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="itemType">Jenis Barang</label>
              <select 
                id="itemType" name="itemType" required
                value={formData.itemType} onChange={handleInputChange}
              >
                <option>Kemeja</option><option>Celana</option><option>Gaun</option><option>Jaket</option><option>Lainnya</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="itemDescription">Deskripsi/Kondisi Barang</label>
              <textarea 
                id="itemDescription" name="itemDescription" rows="3" required
                value={formData.itemDescription} onChange={handleInputChange}
              ></textarea>
            </div>

            <AIChecker onCheckComplete={setAiResult} />

            <button 
              type="submit" 
              disabled={!isFormValid || isSubmitting} 
              className="button-primary"
              style={{
                opacity: (!isFormValid || isSubmitting) ? 0.5 : 1,
                cursor: (!isFormValid || isSubmitting) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Detail Barang'}
            </button>
          </form>
        </>
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

function Notification({ message }) {
  return (
    <div className="notification-popup">
      {message}
    </div>
  );
}

function ShoppingCart({ items, onClose, onRemove, onToggleSelect, onUpdateQuantity }) {
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

export {SubmissionModal};
