import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { MapPin, Clock, Calendar } from 'lucide-react';
import api from '../../services/api';

export const PenghuniDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handlePresensi = () => {
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    if (!navigator.geolocation) {
      setStatusMsg({ type: 'error', text: 'Geolocation tidak didukung browser ini.' });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await api.post('/presensi', {
            lat: position.coords.latitude,
            long: position.coords.longitude
          });
          setStatusMsg({ type: 'success', text: res.data.message });
        } catch (err: any) {
          setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Gagal presensi' });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setStatusMsg({ type: 'error', text: 'Gagal mengambil lokasi. Izinkan akses GPS.' });
        setLoading(false);
      }
    );
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Dashboard Penghuni</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Presensi Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-6 rounded-2xl border border-indigo-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-primary">
            <MapPin size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Presensi Sekarang</h2>
          <p className="text-sm text-gray-600 mb-6">
            Pastikan Anda berada di area asrama (radius 100m) dan mengizinkan akses lokasi.
          </p>
          
          <Button 
            onClick={handlePresensi} 
            isLoading={loading}
            className="w-full text-lg py-4 shadow-md hover:shadow-lg transition-all"
          >
            LAKUKAN PRESENSI
          </Button>

          {statusMsg.text && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {statusMsg.text}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Waktu Presensi</h3>
              <p className="text-sm text-gray-500">Subuh: 04.00 - 06.00 WIB</p>
              <p className="text-sm text-gray-500">Malam: 18.00 - 20.30 WIB</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Profil Saya</h3>
              <p className="text-sm text-gray-500">{user?.nama} ({user?.role})</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
