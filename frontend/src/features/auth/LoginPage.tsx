import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getRolePath } from '../../lib/auth';
import './LoginPage.css';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  CheckSquare,
  Square,
  Users,
  Building2,
  Sparkles,
  Home,
  X,
  Copy,
  Check,
} from 'lucide-react';

export type RoleTab = 'PENGHUNI' | 'FASIL' | 'ADMIN';

interface RoleConfig {
  id: RoleTab;
  tabLabel: string;
  roleTitle: string;
  portalBadge: string;
  description: string;
  icon: typeof Home;
  emailPlaceholder: string;
  defaultEmail: string;
  defaultPassword: string;
  submitLabel: string;
}

const ROLES: RoleConfig[] = [
  {
    id: 'PENGHUNI',
    tabLabel: 'Penghuni',
    roleTitle: 'Warga Asrama',
    portalBadge: 'Portal Mahasiswa',
    description: 'Catat presensi harian Subuh & Malam serta ajukan perizinan asrama dengan mudah dan cepat.',
    icon: Home,
    emailPlaceholder: 'penghuni@unand.ac.id',
    defaultEmail: 'penghuni@unand.ac.id',
    defaultPassword: '123456',
    submitLabel: 'Masuk sebagai Penghuni',
  },
  {
    id: 'FASIL',
    tabLabel: 'Fasilitator',
    roleTitle: 'Fasilitator Pembina',
    portalBadge: 'Portal Pembina',
    description: 'Pantau kehadiran warga binaan dan verifikasi permohonan izin asrama secara real-time.',
    icon: Users,
    emailPlaceholder: 'fasil@unand.ac.id',
    defaultEmail: 'fasil@unand.ac.id',
    defaultPassword: '123456',
    submitLabel: 'Masuk sebagai Fasilitator',
  },
  {
    id: 'ADMIN',
    tabLabel: 'Admin',
    roleTitle: 'Administrator Utama',
    portalBadge: 'Panel Tata Kelola',
    description: 'Pusat kendali operasional hunian, geofencing GPS, dan audit integritas sistem asrama.',
    icon: Shield,
    emailPlaceholder: 'admin@unand.ac.id',
    defaultEmail: 'admin@unand.ac.id',
    defaultPassword: '123456',
    submitLabel: 'Masuk sebagai Admin',
  },
];

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<RoleTab>('PENGHUNI');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const [identifier, setIdentifier] = useState('penghuni@unand.ac.id');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [showHelpPopover, setShowHelpPopover] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const currentRole = ROLES.find((r) => r.id === activeRole) || ROLES[0];
  const roleIndex = ROLES.findIndex((r) => r.id === activeRole);

  const handleRoleSelect = (newRole: RoleTab) => {
    if (newRole === activeRole) return;
    const currentIndex = ROLES.findIndex((r) => r.id === activeRole);
    const targetIndex = ROLES.findIndex((r) => r.id === newRole);
    setSlideDirection(targetIndex > currentIndex ? 'left' : 'right');
    setActiveRole(newRole);

    const targetConfig = ROLES[targetIndex];
    if (targetConfig) {
      setIdentifier(targetConfig.defaultEmail);
      setPassword(targetConfig.defaultPassword);
    }
  };

  const handleFillDemo = () => {
    setIdentifier(currentRole.defaultEmail);
    setPassword(currentRole.defaultPassword);
    setError('');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('asrama@unand.ac.id');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRolePath(user.role) + '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user) {
    return <Navigate to={getRolePath(user.role) + '/dashboard'} replace />;
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
      const cleanId = identifier.trim();
      const res = await login({ identifier: cleanId, email: cleanId, password });
      const userObj = res?.user || (res as any)?.data?.user;
      const role = userObj?.role;
      if (!role) {
        throw new Error('Data pengguna atau peran tidak ditemukan pada respons server.');
      }
      const path = getRolePath(role);
      navigate(path + '/dashboard', { replace: true });
    } catch (err: any) {
      const resData = err?.response?.data;
      let msg = 'Kredensial tidak valid. Silakan coba lagi.';
      if (typeof resData?.message === 'string') {
        msg = resData.message;
      } else if (Array.isArray(resData?.message)) {
        msg = resData.message.join(', ');
      } else if (resData?.message && typeof resData.message === 'object') {
        msg =
          (typeof resData.message.message === 'string' ? resData.message.message : '') ||
          (typeof resData.message.error === 'string' ? resData.message.error : '') ||
          'Kredensial tidak valid. Silakan coba lagi.';
      } else if (typeof resData?.error === 'string') {
        msg = resData.error;
      } else if (typeof err?.message === 'string') {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const RoleIcon = currentRole.icon;

  return (
    <div className="glass-login-page">
      {/* Ambient Glowing Orbs */}
      <div className="glass-ambient-orb orb-emerald-1" />
      <div className="glass-ambient-orb orb-gold" />
      <div className="glass-ambient-orb orb-teal" />
      <div className="glass-grid-overlay" />

      {/* Main Split-Screen Card */}
      <div className="glass-split-card">
        {/* ========================================================
            PANEL KIRI (45% lebar) — Visual Identitas & Peran Dinamis
           ======================================================== */}
        <div className="glass-left-panel">
          {/* Top Brand Identity */}
          <div className="glass-brand-top">
            <div className="glass-brand-logo">
              <Building2 size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="glass-brand-title">SIPRESMA</div>
              <div className="glass-brand-sub">Universitas Andalas</div>
            </div>
          </div>

          {/* Center Dynamic Role Showcase with Horizontal Slide Motion */}
          <div
            key={activeRole}
            className={`glass-role-showcase ${
              slideDirection === 'left' ? 'slide-in-right' : 'slide-in-left'
            }`}
          >
            <div className="glass-icon-wrapper">
              <RoleIcon size={38} className="text-emerald-400" strokeWidth={1.8} />
            </div>
            <div className="glass-role-badge-pill">
              <Sparkles size={12} />
              <span>{currentRole.portalBadge}</span>
            </div>
            <h2 className="glass-role-title">{currentRole.roleTitle}</h2>
            <p className="glass-role-desc">{currentRole.description}</p>
          </div>

          {/* Bottom Pagination Dots */}
          <div className="glass-pagination-dots">
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSelect(role.id)}
                className={`pagination-dot ${role.id === activeRole ? 'active' : 'inactive'}`}
                title={`Pilih peran ${role.tabLabel}`}
                aria-label={`Slide ke ${role.tabLabel}`}
              />
            ))}
          </div>
        </div>

        {/* ========================================================
            PANEL KANAN (55% lebar) — Form Login Glassy & Interaktif
           ======================================================== */}
        <div className="glass-right-panel">
          {/* Header & Help Popover */}
          <div className="glass-form-header">
            <div>
              <h1 className="glass-form-title">Selamat Datang</h1>
              <p className="glass-form-subtitle">
                Masuk dengan akun terdaftar untuk mengakses presensi
              </p>
            </div>

            {/* Help Button with Popover */}
            <div className="help-btn-wrapper">
              <button
                type="button"
                onClick={() => setShowHelpPopover(!showHelpPopover)}
                className={`btn-help-trigger ${showHelpPopover ? 'active' : ''}`}
                title="Bantuan pengguna baru"
              >
                <HelpCircle size={18} />
              </button>

              {showHelpPopover && (
                <div className="glass-popover-card">
                  <div className="popover-header">
                    <span className="popover-title-text">
                      <Sparkles size={13} />
                      Info Mahasiswa Baru
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHelpPopover(false)}
                      className="popover-close-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="popover-body-text">
                    Penghuni baru <strong>tidak perlu mendaftar mandiri</strong>. Akun
                    diaktifkan otomatis oleh Pengelola Asrama berdasarkan SK penetapan.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sliding Role Switcher */}
          <div className="sliding-role-container">
            <div
              className="sliding-pill-indicator"
              style={{
                transform: `translateX(${roleIndex * 100}%)`,
              }}
            />
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleSelect(r.id)}
                className={`sliding-role-tab ${activeRole === r.id ? 'active' : ''}`}
              >
                {r.tabLabel}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="glass-error-banner">
              <AlertCircle size={16} className="shrink-0" />
              <span>{typeof error === 'string' ? error : (error as any)?.message || JSON.stringify(error)}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-form-body">
            {/* Email Field */}
            <div className="glass-input-group">
              <label htmlFor="login-email" className="glass-field-label">
                Alamat Email / Akun
              </label>
              <div className="glass-input-wrapper">
                <Mail size={16} className="glass-input-icon" />
                <input
                  id="login-email"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={currentRole.emailPlaceholder}
                  className="glass-text-input"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="glass-input-group">
              <div className="glass-label-row">
                <label htmlFor="login-password" className="glass-field-label">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="btn-forgot-password"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="glass-input-wrapper">
                <Lock size={16} className="glass-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="glass-text-input"
                  style={{ paddingRight: '44px' }}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn-pwd-eye"
                  tabIndex={-1}
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Demo Fill */}
            <div className="glass-actions-row">
              <button
                type="button"
                className="remember-session-btn"
                onClick={() => setRememberMe(!rememberMe)}
              >
                {rememberMe ? (
                  <CheckSquare size={17} className="text-emerald-700" />
                ) : (
                  <Square size={17} className="text-slate-400" />
                )}
                <span>Ingat sesi</span>
              </button>

              <button
                type="button"
                onClick={handleFillDemo}
                className="btn-fill-demo"
                title="Isi kredensial akun demo untuk peran ini"
              >
                <Sparkles size={13} />
                <span>Isi Akun Demo</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="glass-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Memproses masuk...</span>
                </>
              ) : (
                <>
                  <span>{currentRole.submitLabel}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="glass-form-footer">
            Sistem Informasi Presensi Asrama &bull; UPT Asrama UNAND
          </p>
        </div>
      </div>

      {/* ========================================================
          MODAL: Lupa Kata Sandi (Glassy Pop-up)
         ======================================================== */}
      {showForgotModal && (
        <div className="glass-modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="glass-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="glass-modal-header">
              <div className="glass-modal-title">
                <Shield size={18} className="text-emerald-700" />
                Reset Kata Sandi Akun
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="popover-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <p className="glass-modal-body-text">
              Untuk menjaga integritas dan keamanan data asrama, pemulihan akun dilakukan
              melalui verifikasi langsung oleh Pengelola UPT Asrama Mahasiswa UNAND.
              Silakan hubungi loket layanan gedung atau kirimkan email resmi:
            </p>

            <div className="glass-contact-box">
              <span className="glass-contact-email">asrama@unand.ac.id</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn-fill-demo"
                style={{ padding: '6px 12px' }}
              >
                {copiedEmail ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                <span>{copiedEmail ? 'Tersalin' : 'Salin Email'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="btn-close-modal"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
