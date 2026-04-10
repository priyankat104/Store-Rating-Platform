import { useEffect, useState, useCallback } from 'react';
import { userAPI } from '../services/api';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, MapPin, Star, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// ── Rating Modal ───────────────────────────────────────────────────────────────
const RatingModal = ({ store, onClose, onSaved }) => {
  const [rating, setRating]   = useState(store.userRating || 0);
  const [loading, setLoading] = useState(false);

  const isUpdate = !!store.userRatingId;

  const handleSave = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      if (isUpdate) {
        await userAPI.updateRating(store.userRatingId, { rating });
        toast.success('Rating updated!');
      } else {
        await userAPI.submitRating({ storeId: store.id, rating });
        toast.success('Rating submitted!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save rating');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-sm p-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-semibold text-white">{isUpdate ? 'Update Rating' : 'Rate Store'}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{store.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={20} /></button>
        </div>

        <div className="flex flex-col items-center gap-4 py-4">
          <StarRating value={rating} onChange={setRating} size={36} />
          <p className="text-sm text-slate-400">{rating ? `${rating} / 5 stars` : 'Click a star to rate'}</p>
        </div>

        <div className="flex gap-3 mt-2">
          <button onClick={handleSave} disabled={loading || !rating} className="btn-primary flex-1">
            {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto block" /> : isUpdate ? 'Update' : 'Submit'}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ── Store Card ─────────────────────────────────────────────────────────────────
const StoreCard = ({ store, onRate }) => (
  <div className="card p-5 hover:border-primary-500/40 transition-all duration-200 flex flex-col gap-4">
    <div className="flex justify-between items-start gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-base truncate">{store.name}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin size={13} className="text-slate-500 shrink-0" />
          <p className="text-xs text-slate-400 truncate">{store.address}</p>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0">
        {store.averageRating ? (
          <>
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-amber-400 text-sm">{store.averageRating}</span>
            </div>
            <span className="text-xs text-slate-500">Overall</span>
          </>
        ) : (
          <span className="text-xs text-slate-500">No ratings yet</span>
        )}
      </div>
    </div>

    {/* User's rating */}
    <div className="border-t border-slate-700/50 pt-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500 mb-1">Your rating</p>
        {store.userRating
          ? <StarRating value={store.userRating} readOnly size={16} />
          : <span className="text-xs text-slate-500 italic">Not rated yet</span>
        }
      </div>
      <button
        id={`rate-btn-${store.id}`}
        onClick={() => onRate(store)}
        className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-all ${
          store.userRating
            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            : 'bg-primary-600 hover:bg-primary-700 text-white'
        }`}
      >
        {store.userRating ? 'Edit Rating' : 'Rate'}
      </button>
    </div>
  </div>
);

// ── Password Update Section ────────────────────────────────────────────────────
const UpdatePasswordPanel = () => {
  const [form, setForm]       = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.currentPassword)               err.currentPassword = 'Required';
    if (!passwordRegex.test(form.newPassword)) err.newPassword = 'Password: 8–16 chars, 1 uppercase, 1 special';
    if (Object.keys(err).length) { setErrors(err); return; }
    setLoading(true);
    try {
      await userAPI.updatePassword(form);
      toast.success('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '' });
      setErrors({});
    } catch (err2) {
      toast.error(err2.response?.data?.message || 'Failed to update password');
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
const UserDashboard = () => {
  const [stores, setStores]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState({ name: '', address: '' });
  const [activeStore, setActiveStore] = useState(null); // for rating modal
  const [tab, setTab]             = useState('stores'); // 'stores' | 'settings'

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.name)    params.name    = search.name;
      if (search.address) params.address = search.address;
      const res = await userAPI.getStores(params);
      setStores(res.data.stores);
    } catch (err) {
      toast.error('Failed to load stores');
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Browse and rate stores</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 gap-1">
          {['stores', 'settings'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'text-primary-400 border-b-2 border-primary-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'stores' ? 'All Stores' : 'Settings'}
            </button>
          ))}
        </div>

        {tab === 'stores' && (
          <>
            {/* Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="search-name"
                  type="text"
                  className="input-field pl-10 text-sm"
                  placeholder="Search by store name…"
                  value={search.name}
                  onChange={(e) => setSearch({ ...search, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="search-address"
                  type="text"
                  className="input-field pl-10 text-sm"
                  placeholder="Search by address…"
                  value={search.address}
                  onChange={(e) => setSearch({ ...search, address: e.target.value })}
                />
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <LoadingSpinner />
            ) : stores.length === 0 ? (
              <div className="text-center py-16 text-slate-500">No stores found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store, idx) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <StoreCard store={store} onRate={setActiveStore} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'settings' && <UpdatePasswordPanel />}
      </div>

      {activeStore && (
        <RatingModal
          store={activeStore}
          onClose={() => setActiveStore(null)}
          onSaved={fetchStores}
        />
      )}
    </div>
  );
};

export default UserDashboard;
