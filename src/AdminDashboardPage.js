import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './App.css'; // Pastikan path ini benar

const IconLayoutDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconPackageCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 2 2 4-4"></path><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><path d="M16.5 9.4 7.55 4.24"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>;
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconAward = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"></polyline></svg>;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalSubmissions: 0, approved: 0, rejected: 0, totalCustomers: 0, waterSaved: 0, co2Saved: 0, categories: {} });
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [pointsModal, setPointsModal] = useState({ isOpen: false, submission: null });
  const [activeView, setActiveView] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  const db = getFirestore();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = {};
      usersSnapshot.forEach(doc => { usersData[doc.id] = doc.data(); });
      setUsers(usersData);
  
      const submissionsSnapshot = await getDocs(collection(db, "recycles"));
      const submissionsList = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(submissionsList);
  
      if (submissionsList.length > 0) {
        const totalSubmissions = submissionsList.length;
        const approved = submissionsList.filter(s => s.status === 'approved').length;
        const rejected = submissionsList.filter(s => s.status === 'rejected').length;
        const uniqueCustomers = new Set(submissionsList.map(s => s.userId)).size;
        
        const waterSaved = totalSubmissions * 2700;
        const co2Saved = totalSubmissions * 2.1;
        
        const categories = submissionsList.reduce((acc, s) => {
          const category = s.jenisBarang || 'Lainnya';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        
        setStats({ totalSubmissions, approved, rejected, totalCustomers: uniqueCustomers, waterSaved, co2Saved, categories });
      } else {
        setStats({ totalSubmissions: 0, approved: 0, rejected: 0, totalCustomers: 0, waterSaved: 0, co2Saved: 0, categories: {} });
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateStatus = async (id, status) => {
    await updateDoc(doc(db, "recycles", id), { status });
    setNotification({ message: `Status berhasil diubah menjadi ${status}`, type: 'success' });
    fetchData();
  };

  const handleAddPoints = async (submissionId, userId, pointsToAdd) => {
    if (!userId || !pointsToAdd || pointsToAdd <= 0) {
      setNotification({ message: 'User ID atau jumlah poin tidak valid.', type: 'error' });
      return;
    }
    const points = parseInt(pointsToAdd, 10);
    try {
      await updateDoc(doc(db, "users", userId), { rewardPoints: increment(points) });
      await updateDoc(doc(db, "recycles", submissionId), { pointsAwarded: points, status: 'completed' });
      setNotification({ message: `Berhasil menambahkan ${points} poin ke user!`, type: 'success' });
      setPointsModal({ isOpen: false, submission: null });
      fetchData();
    } catch (error) {
      console.error("Error adding points:", error);
      setNotification({ message: 'Gagal menambahkan poin.', type: 'error' });
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/login')).catch((error) => console.error("Logout error:", error));
  };

  return (
    <div className="admin-layout">
      <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />
      <main className="admin-main-content">
        {activeView === 'dashboard' && <DashboardView stats={stats} isLoading={isLoading} />}
        {activeView === 'submissions' && <SubmissionsView submissions={submissions} users={users} onUpdateStatus={handleUpdateStatus} onOpenPointsModal={(submission) => setPointsModal({ isOpen: true, submission })} />}
      </main>
      {pointsModal.isOpen && <PointsModal submission={pointsModal.submission} onClose={() => setPointsModal({ isOpen: false, submission: null })} onAddPoints={handleAddPoints} />}
      {notification && <PageNotification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}

function Sidebar({ activeView, setActiveView, onLogout }) {
  return (
    <aside className="admin-sidebar">
      <div>
        <div className="sidebar-logo-container">
          <img src="https://i.imgur.com/3Lw3p9a.png" alt="ReWear Logo" className="sidebar-logo-img" />
          <h1 className="logo">ReWear</h1>
        </div>
        <p className="admin-panel-label"></p>
        <nav className="admin-sidebar-nav">
          <button onClick={() => setActiveView('dashboard')} className={`nav-button ${activeView === 'dashboard' ? 'active' : ''}`}>
            <IconLayoutDashboard /> Dashboard
          </button>
          <button onClick={() => setActiveView('submissions')} className={`nav-button ${activeView === 'submissions' ? 'active' : ''}`}>
            <IconPackageCheck /> Konfirmasi Barang
          </button>
        </nav>
      </div>
      <button onClick={onLogout} className="admin-logout-button">
        <IconLogout /> Logout
      </button>
    </aside>
  );
}

function DashboardView({ stats, isLoading }) {
  if (isLoading) return <div className="loading-state">Memuat data statistik...</div>;
  
  return (
    <>
      <header className="admin-header">
        <h1>Dashboard Statistik</h1>
        <p>Ringkasan aktivitas dan dampak lingkungan dari ReWear.</p>
      </header>
      <section className="stats-grid-revamped">
        <StatCard emoji="📦" title="Total Penerimaan" value={stats.totalSubmissions} unit="pakaian" />
        <StatCard emoji="👥" title="Customer Berpartisipasi" value={stats.totalCustomers} unit="orang" />
        <StatCard emoji="💧" title="Estimasi Air Dihemat" value={`${stats.waterSaved.toLocaleString('id-ID')}`} unit="L" />
        <StatCard emoji="💨" title="Estimasi CO2 Dikurangi" value={`${stats.co2Saved.toLocaleString('id-ID', {maximumFractionDigits: 1})}`} unit="kg" />
      </section>
    </>
  );
}

function SubmissionsView({ submissions, users, onUpdateStatus, onOpenPointsModal }) {
  return (
    <>
      <header className="admin-header">
        <h1>Konfirmasi Pengiriman Barang</h1>
        <p>Setujui atau tolak barang yang dikirim oleh customer dan berikan poin.</p>
      </header>
      <section className="table-section">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Jenis Barang</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr><td colSpan="5" className="empty-table-cell">Belum ada pengiriman barang.</td></tr>
              ) : (
                submissions.map(s => (
                  <tr key={s.id}>
                    <td>{users[s.userId]?.email || 'N/A'}</td>
                    <td>{s.jenisBarang}</td>
                    <td>{s.deskripsiKondisi}</td>
                    <td><span className={`status-badge status-${s.status}`}>{s.status.replace('_', ' ')}</span></td>
                    <td className="action-cell">
                      
                      {(s.status === 'pending' || s.status === 'pending_approval') && (
                        <>
                          <button onClick={() => onUpdateStatus(s.id, 'approved')} className="action-button approve">Approve</button>
                          <button onClick={() => onUpdateStatus(s.id, 'rejected')} className="action-button reject">Reject</button>
                        </>
                      )}
                      
                      {s.status === 'approved' && (
                        <button onClick={() => onOpenPointsModal(s)} className="action-button points"><IconAward /> Beri Poin</button>
                      )}
                      
                      {s.status === 'completed' && (
                        <span className="points-awarded">{s.pointsAwarded || 0} poin diberikan</span>
                      )}
                      
                      {s.status === 'rejected' && (
                        <span className="points-awarded">-</span>
                      )}

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function StatCard({ emoji, title, value, unit }) {
  return (
    <div className="stat-card-revamped">
      <span className="stat-emoji">{emoji}</span>
      <div className="stat-info">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value} <span className="stat-unit">{unit}</span></h3>
      </div>
    </div>
  );
}

function PointsModal({ submission, onClose, onAddPoints }) {
  const [points, setPoints] = useState('100');
  const handleSubmit = (e) => { e.preventDefault(); onAddPoints(submission.id, submission.userId, points); };
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <button onClick={onClose} className="modal-close-button">✕</button>
        <h3>Beri Reward Points</h3>
        <p>Masukkan jumlah poin untuk pengiriman: <strong>{submission.jenisBarang}</strong></p>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="points">Jumlah Poin</label>
            <input type="number" id="points" value={points} onChange={(e) => setPoints(e.target.value)} required min="1" />
          </div>
          <button type="submit" className="button-primary">Kirim Poin</button>
        </form>
      </div>
    </div>
  );
}

function PageNotification({ message, type, onClose }) {
  return (
    <div className={`page-notification ${type}`}>
      <p>{message}</p>
      <button onClick={onClose} className="notification-close-btn">✕</button>
    </div>
  );
}