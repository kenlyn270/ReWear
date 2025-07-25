import React, { useState, useEffect } from 'react';
import './App.css'; 
import AIChecker from './AIChecker'; 
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from './AuthContext';
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const IconShoppingCart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  const [userStats, setUserStats] = useState({
    rewardPoints: 0,
    recycledCount: 0,
    waterSaved: 0,
    co2Saved: 0,
    isLoading: true
  });

  const { currentUser } = useAuth();
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Oops, gagal memuat produk.");
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

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUser) {
        console.log("Menunggu data user (currentUser masih kosong)...");
        setUserStats(prev => ({ ...prev, isLoading: false }));
        return;
      }

      console.log("User ditemukan, mencoba mengambil statistik untuk:", currentUser.uid);
      setUserStats(prev => ({ ...prev, isLoading: true }));
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const points = userDocSnap.exists() ? userDocSnap.data().rewardPoints : 0;
        console.log("Poin user:", points);

        const recyclesQuery = query(collection(db, "recycles"), where("userId", "==", currentUser.uid));
        const recyclesSnapshot = await getDocs(recyclesQuery);
        const recycledCount = recyclesSnapshot.size;
        console.log("Jumlah pakaian dikembalikan:", recycledCount);

        const waterSaved = recycledCount * 2700;
        const co2Saved = recycledCount * 2.1;

        const newStats = {
          rewardPoints: points,
          recycledCount: recycledCount,
          waterSaved: waterSaved,
          co2Saved: co2Saved,
          isLoading: false
        };
        setUserStats(newStats);
        console.log("✅ Statistik user berhasil dihitung:", newStats);
      } catch (error) {
        console.error("❌ Gagal mengambil statistik user:", error);
        setUserStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchUserStats();
  }, [currentUser]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/');
    }).catch((error) => {
      console.error("Logout Error:", error);
      setNotification({ message: 'Gagal untuk logout.', type: 'error' });
    });
  };

function UserStatsSection({ stats }) {
  if (stats.isLoading) {
    return <div className="user-stats-loading">Memuat kontribusimu...</div>;
  }

  return (
    <section className="user-stats-section">
      <h2>Kontribusi Anda</h2>
      <p className="impact-explanation">
        Tahukah Anda? Pembuatan 1 baju katun membutuhkan hingga <strong>2.700 liter air</strong> dan menghasilkan <strong>2,1 kg CO2</strong>.
        Dengan mendaur ulang, Anda telah membantu menghemat sumber daya berharga ini!
      </p>
      <div className="stats-grid-customer">
        <StatCardCustomer title="Reward Points Anda" value={stats.rewardPoints.toLocaleString('id-ID')} />
        <StatCardCustomer title="Pakaian Dikembalikan" value={`${stats.recycledCount} Pcs`} />
        <StatCardCustomer title="Estimasi Air Dihemat" value={`${stats.waterSaved.toLocaleString('id-ID')} L`} />
        <StatCardCustomer title="Estimasi CO2 Dikurangi" value={`${stats.co2Saved.toLocaleString('id-ID', {maximumFractionDigits: 1})} kg`} />
      </div>
    </section>
  );
}

function StatCardCustomer({ title, value }) {
  return (
    <div className="stat-card-customer">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}

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
      <Header cartItemCount={totalCartQuantity} onCartClick={toggleCart} onLogout={handleLogout} />
      <main>
        <HeroSection onSendClick={handleOpenModal} />
        
        <UserStatsSection stats={userStats} />
        
        <section className="catalog-section">
          <h2>Produk Hasil Daur Ulang</h2>
          <p>Beli produk keren sambil membantu bumi.</p>
          
          {error ? (
            <div className="error-ui-message"><p>{error}</p></div>
          ) : (
            <ProductCatalog products={products} isLoading={isLoading} onAddToCart={handleAddToCart} />
          )}
        </section>
      </main>
      <Footer />
      
      {isModalOpen && <SubmissionModal onClose={handleCloseModal} setNotification={setNotification} />}
      
      {isCartOpen && (
        <ShoppingCart 
          items={cartItems} 
          onClose={() => setIsCartOpen(false)} 
          setNotification={setNotification}
          onRemove={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          onToggleSelect={handleToggleSelectItem}
        />
      )}

      {notification && <Notification message={notification} />}
    </div>
  );
}

function UserStatsSection({ stats }) {
  if (stats.isLoading) {
    return <div className="user-stats-loading">Memuat kontribusimu...</div>;
  }

  return (
    <section className="user-stats-section">
      <h2>Kontribusi Anda</h2>
      <p className="impact-explanation">
        Tahukah Anda? Pembuatan 1 baju katun membutuhkan hingga <strong>2.700 liter air</strong> dan menghasilkan <strong>2,1 kg CO2</strong>.
        Dengan mendaur ulang, Anda telah membantu menghemat sumber daya berharga ini!
      </p>
      <div className="stats-grid-customer">
        <StatCardCustomer title="Reward Points Anda" value={stats.rewardPoints.toLocaleString('id-ID')} />
        <StatCardCustomer title="Pakaian Dikembalikan" value={`${stats.recycledCount} Pcs`} />
        <StatCardCustomer title="Estimasi Air Dihemat" value={`${stats.waterSaved.toLocaleString('id-ID')} L`} />
        <StatCardCustomer title="Estimasi CO2 Dikurangi" value={`${stats.co2Saved.toLocaleString('id-ID', {maximumFractionDigits: 1})} kg`} />
      </div>
    </section>
  );
}

function StatCardCustomer({ title, value }) {
  return (
    <div className="stat-card-customer">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}

function Header({ cartItemCount, onCartClick, onLogout }) {
  const navItems = ['Woman', 'Men', 'Kids', 'Baby'];
  const { currentUser } = useAuth();

  return (
    <header className="app-header">
      <nav className="header-nav">
        <div className="logo-container">
          <img src="https://i.imgur.com/3Lw3p9a.png" alt="ReWear Logo" className="logo-img" />
          <h1 className="logo-text">ReWear</h1>
        </div>
        <div className="nav-links">
          {navItems.map(item => <a key={item} href="/#">{item}</a>)}
          <a href="/#" className="active">Recycle</a>
          <div className="header-icons">
            <button onClick={onCartClick} className="cart-button">
              <IconShoppingCart />
              {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </button>
            {currentUser && (
              <button onClick={onLogout} className="logout-button" title="Logout">
                <IconLogout />
              </button>
            )}
          </div>
        </div>
        <button className="mobile-menu-button">{/* ... */}</button>
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
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    noTelp: '',
    itemType: 'Kemeja',
    deliveryOption: 'pickup', 
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
    console.log("VALIDASI DIJALANKAN, DATA SAAT INI:", { 
      formData, 
      aiResult,
      allFieldsFilled: Object.values(formData).every(value => value.trim() !== ''),
      aiStatus: aiResult?.status
    });

    const allFieldsFilled = Object.values(formData).every(value => value.trim() !== '');
    
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
      userId: currentUser.uid,
      namaLengkap: formData.fullName,
      metodePengiriman: formData.deliveryOption, 
      alamatPenjemputan: formData.address,
      status: "pending",
      jenisBarang: formData.itemType,
      deskripsiKondisi: formData.itemDescription,
      createdAt: serverTimestamp(),
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
                <label>Metode Pengiriman</label>
                <div className="delivery-options-container">
                  <label className="delivery-option-label">
                    <input type="radio" name="deliveryOption" value="pickup" checked={formData.deliveryOption === 'pickup'} onChange={handleInputChange} />
                    <span className="custom-radio"></span>
                    <span className="delivery-option-text">Jemput Kurir (JNE)</span>
                  </label>
                  <label className="delivery-option-label">
                    <input type="radio" name="deliveryOption" value="dropoff" checked={formData.deliveryOption === 'dropoff'} onChange={handleInputChange} />
                    <span className="custom-radio"></span>
                    <span className="delivery-option-text">Drop Off Mandiri</span>
                  </label>
                </div>
              </div>

            <div className="form-group">
              <label htmlFor="address">
                Alamat Penjemputan 
                {formData.deliveryOption === 'dropoff' && <span style={{color: '#999', fontWeight: 'normal'}}> (Opsional)</span>}
              </label>
              <textarea 
                id="address" 
                name="address" 
                rows="3" 
                required={formData.deliveryOption === 'pickup'}
                value={formData.address} 
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="form-group">
            <label htmlFor="noTelp">Nomor Telepon</label>
            <input 
              type="tel" 
              id="noTelp" 
              name="noTelp" 
              required 
              value={formData.noTelp} 
              onChange={handleInputChange} 
            />
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
          <h3>ReWear</h3>
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
            <li><a href="/#">Visi & Misi</a></li><li><a href="/#">Program Daur Ulang</a></li><li></li>
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

function ShoppingCart({ items, onClose, setNotification, onRemove, onToggleSelect, onUpdateQuantity }) {
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
                          <button 
                            className="button-primary" 
                            onClick={() => {
                              setNotification('Fitur terintegrasi dengan aplikasi utama perusahaan! ✨');
                              onClose(); 
                            }}
                          >
                            Checkout
                          </button>                   
                        </div>
                )}
            </div>
        </div>
    );
}

export {SubmissionModal};