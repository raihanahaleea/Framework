import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/auth/Login';
import { Layout } from './components/Layout';
import { PenghuniDashboard } from './pages/penghuni/Dashboard';

// Dummy components for uncompleted pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 text-center animate-fade-in">
    <h2 className="text-2xl font-bold text-gray-700 mb-2">{title}</h2>
    <p className="text-gray-500">Halaman ini sedang dalam tahap pengembangan.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Layout />}>
            {/* Redirect root based on auth is handled in Layout, but default to /login if empty */}
            <Route index element={<Navigate to="/login" replace />} />
            
            {/* Penghuni Routes */}
            <Route path="penghuni">
              <Route index element={<PenghuniDashboard />} />
              <Route path="izin" element={<Placeholder title="Pengajuan Izin" />} />
            </Route>

            {/* Fasil Routes */}
            <Route path="fasil">
              <Route index element={<Placeholder title="Dashboard Fasilitator" />} />
              <Route path="warga" element={<Placeholder title="Data Warga & Approval" />} />
            </Route>

            {/* Admin Routes */}
            <Route path="admin">
              <Route index element={<Placeholder title="Dashboard Admin" />} />
              <Route path="users" element={<Placeholder title="Kelola User & Gedung" />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
