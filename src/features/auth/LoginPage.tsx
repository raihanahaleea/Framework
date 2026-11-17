git commit -m "pesan commit Anda"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getRolePath } from '../../lib/auth';
import './LoginPage.css';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  QrCode,
  Shield,
  Activity,
  Key,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  CheckSquare,
  Square,
  ExternalLink,
  Users,
  Building2,
} from 'lucide-react';

type RoleTab = 'PENGHUNI' | 'FASIL' | 'ADMIN';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [activeRole, setActiveRole] = useState<RoleTab>('PENGHUNI');

  // If already authenticated, redirect
  if (isAuthenticated && user) {
    navigate(getRolePath(user.role) + '/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Email wajib diisi');
      return;
    }
    if (!password.trim()) {
      setError('Kata sandi wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({ identifier: identifier.trim(), password });
      const path = getRolePath(res.user.role);
      navigate(path + '/dashboard', { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Kredensial tidak valid. Silakan coba lagi.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ===== NAVBAR ===== */}
      <nav className="login-navbar">
        <div className="login-navbar-inner">
          <div className="navbar-left">
            <div className="navbar-logo-icon">
              <Building2 size={18} strokeWidth={2} />
            </div>
            <div className="navbar-brand">
              <div className="navbar-brand-row">
                <span className="navbar-title">SIPRESMA</span>
                <span className="navbar-active-badge">
                  <span className="active-dot" />
                  Sistem Aktif
                </span>
              </div>
              <span className="navbar-subtitle">Universitas Andalas</span>
            </div>
          </div>
          <div className="navbar-right">
            <a href="#" className="navbar-link">
              <Key size={14} />
              Single Sign-On SSO UNAND
            </a>
            <a href="#" className="navbar-link">
              <HelpCircle size={14} />
              Bantuan Pengguna
            </a>
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="login-main">
        <div className="login-container">
          {/* LEFT PANEL - Feature Branding */}
          <div className="login-left-panel">
            <div className="left-panel-inner">
              {/* Top badge */}
              <div className="left-badge">
                <Shield size={14} />
                UPT Asrama Mahasiswa UNAND
              </div>

              {/* Title */}
              <h1 className="left-title">
                Sistem Presensi Asrama Terpadu &amp; Terintegrasi
              </h1>

              {/* Description */}
              <p className="left-description">
                Portal pencatatan presensi digital harian civitas asrama
                Universitas Andalas untuk mewujudkan ketertiban, keamanan, dan
                kedisiplinan asrama.
              </p>

              {/* Feature Cards Grid */}
              <div className="feature-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="feature-card-title">Geofencing Asrama</div>
                    <div className="feature-card-desc">
                      Radius terukur presensi Gedung A, B, C, &amp; D.
                    </div>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <QrCode size={18} />
                  </div>
                  <div>
                    <div className="feature-card-title">QR Code Presensi</div>
                    <div className="feature-card-desc">
                      Validasi cepat Subuh dan Malam secara instan.
                    </div>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <Key size={18} />
                  </div>
                  <div>
                    <div className="feature-card-title">
                      Terintegrasi SSO UNAND
                    </div>
                    <div className="feature-card-desc">
                      Masuk aman menggunakan email resmi kampus.
                    </div>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <Activity size={18} />
                  </div>
                  <div>
                    <div className="feature-card-title">
                      Monitoring Real-time
                    </div>
                    <div className="feature-card-desc">
                      Audit langsung bagi Fasilitator dan Admin.
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="left-bottom">
                <div className="left-bottom-left">
                  <div className="gedung-badges">
                    <span className="gedung-badge ga">GA</span>
                    <span className="gedung-badge gb">GB</span>
                    <span className="gedung-badge gc">GC</span>
                    <span className="gedung-badge gd">GD</span>
                  </div>
                  <div className="gedung-info">
                    <span className="gedung-info-title">
                      4 Kompleks Asrama Mahasiswa
                    </span>
                    <span className="gedung-info-sub">
                      Kampus Limau Manis, Padang
                    </span>
                  </div>
                </div>
                <div className="left-bottom-right">
                  <Shield size={14} />
                  Server Terenkripsi SSL/TLS
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Login Form */}
          <div className="login-right-panel">
            <div className="right-panel-inner">
              {/* Top header row */}
              <div className="form-header-row">
                <div className="portal-badge">
                  <Lock size={12} />
                  Portal Resmi Presensi
                </div>
                <span className="ta-badge">T.A. 2025/2026</span>
              </div>

              {/* Title */}
              <h2 className="form-title">Selamat Datang Kembali</h2>
              <p className="form-subtitle">
                Masuk dengan akun civitas akademika Universitas Andalas untuk
                mengakses portal presensi.
              </p>

              {/* Role Tabs */}
              <div className="role-tabs">
                <div className="role-tabs-icon">
                  <Users size={16} />
                </div>
                <span className="role-tabs-label">
                  Pintu Masuk
                  <br />
                  Terpadu:
                </span>
                <div className="role-tabs-buttons">
                  <button
                    type="button"
                    className={`role-tab ${activeRole === 'PENGHUNI' ? 'active' : ''}`}
                    onClick={() => setActiveRole('PENGHUNI')}
                  >
                    Penghuni
                  </button>
                  <span className="role-tab-dot">•</span>
                  <button
                    type="button"
                    className={`role-tab ${activeRole === 'FASIL' ? 'active' : ''}`}
                    onClick={() => setActiveRole('FASIL')}
                  >
                    Fasilitator
                  </button>
                  <span className="role-tab-dot">•</span>
                  <button
                    type="button"
                    className={`role-tab ${activeRole === 'ADMIN' ? 'active' : ''}`}
                    onClick={() => setActiveRole('ADMIN')}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="login-error animate-fade-in">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="login-form">
                {/* Email field */}
                <div className="form-group">
                  <label htmlFor="login-email" className="form-label">
                    Email <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="login-email"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="2311522040@student.unand.ac.id"
                      className="form-input"
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label htmlFor="login-password" className="form-label">
                      Kata Sandi <span className="required">*</span>
                    </label>
                    <a href="#" className="forgot-link">
                      Lupa kata sandi?
                    </a>
                  </div>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="form-input has-toggle"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="remember-row">
                  <button
                    type="button"
                    className="remember-checkbox"
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    {rememberMe ? (
                      <CheckSquare size={18} className="check-active" />
                    ) : (
                      <Square size={18} className="check-inactive" />
                    )}
                    <span>Ingat sesi di perangkat ini</span>
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="login-submit-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Info notice */}
              <div className="login-notice">
                <AlertCircle size={16} className="notice-icon" />
                <p>
                  <strong>Tidak memiliki akun terdaftar?</strong> Penghuni baru
                  tidak perlu mendaftar mandiri. Akun diaktifkan otomatis oleh
                  Pengelola Asrama berdasarkan penetapan SK Asrama.
                </p>
              </div>

              {/* Bottom links */}
              <div className="form-bottom-row">
                <span className="form-bottom-text">
                  Kendala login akun SSO?
                </span>
                <a href="#" className="form-bottom-link">
                  Hubungi Pengelola Asrama
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="login-footer">
        <div className="login-footer-inner">
          <div className="footer-left">
            <p className="footer-copyright">
              &copy; 2026 SIPRESMA · UPT Asrama Mahasiswa Universitas Andalas
            </p>
            <p className="footer-address">
              Kampus Limau Manis, Kec. Pauh, Kota Padang, Sumatera Barat 25163
            </p>
          </div>
          <div className="footer-right">
            <a href="#" className="footer-link">
              Panduan Presensi
            </a>
            <span className="footer-dot">•</span>
            <a href="#" className="footer-link">
              Tata Tertib Asrama
            </a>
            <span className="footer-dot">•</span>
            <a href="#" className="footer-link footer-status">
              <span className="status-dot-green" />
              Status Server
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
