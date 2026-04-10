import { useEffect, useState, useCallback } from 'react';
import { storeOwnerAPI, userAPI } from '../services/api';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Store, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// ── Password Panel ─────────────────────────────────────────────────────────────
const UpdatePasswordPanel = () => {
  const [form, setForm]       = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.currentPassword)                err.currentPassword = 'Required';
    if (!passwordRegex.test(form.newPassword)) err.newPassword     = 'Password: 8–16 chars, 1 uppercase, 1 special';
    if (Object.keys(err).length) { setErrors(err); return; }
    setLoading(true);
    try {
      await storeOwnerAPI.updatePassword(form);
      toast.success('Password updated!');
      setForm({ currentPassword: '', newPassword: '' });
      setErrors({});
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
          <input type="password" className="input-field" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          {errors.currentPassword && <p className="mt-1 text-xs text-red-400">{errors.currentPassword}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
          <input type="password" className="input-field" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          {errors.newPassword && <p className="mt-1 text-xs text-red-400">{errors.newPassword}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('overview'); // 'overview' | 'settings'

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await storeOwnerAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-white">Store Owner Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor your store's performance</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 gap-1">
          {['overview', 'settings'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'text-primary-400 border-b-2 border-primary-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'settings' && <UpdatePasswordPanel />}

        {tab === 'overview' && (
          loading ? <LoadingSpinner /> :
          !data ? (
            <div className="card p-10 text-center text-slate-500">
              <Store size={40} className="mx-auto mb-3 opacity-40" />
              <p>No store linked to your account yet.</p>
              <p className="text-sm mt-1">Ask an admin to associate a store with your account.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Store Info + Avg Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div className="stat-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
                    <Store size={20} />
                  </div>
                  <p className="text-xl font-bold text-white mt-2">{data.store.name}</p>
                  <p className="text-sm text-slate-400">{data.store.address}</p>
                  <p className="text-xs text-slate-500">{data.store.email}</p>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Star size={20} />
                  </div>
                  <p className="text-3xl font-bold text-white mt-2">
                    {data.averageRating ?? '—'}
                  </p>
                  <p className="text-sm text-slate-400">Average Rating</p>
                  <StarRating value={Math.round(data.averageRating || 0)} readOnly size={18} />
                </motion.div>
              </div>

              {/* Raters List */}
              <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-2">
                  <Users size={18} className="text-slate-400" />
                  <h2 className="font-semibold text-white">Ratings Received</h2>
                  <span className="ml-auto badge bg-primary-500/20 text-primary-300 border border-primary-500/30">
                    {data.raters.length}
                  </span>
                </div>

                {data.raters.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 text-sm">No ratings yet.</div>
                ) : (
                  <div className="divide-y divide-slate-700/50">
                    {data.raters.map((r) => (
                      <div key={r.ratingId} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                        <div>
                          <p className="font-medium text-slate-200 text-sm">{r.user.name}</p>
                          <p className="text-xs text-slate-500">{r.user.email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StarRating value={r.rating} readOnly size={16} />
                          <span className="text-xs text-slate-500">
                            {new Date(r.ratedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
