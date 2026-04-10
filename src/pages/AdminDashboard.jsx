import { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../services/api';
import Navbar from '../components/Navbar';
import SortableTable from '../components/SortableTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Store, Star, Plus, X, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="stat-card">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} />
    </div>
    <p className="text-3xl font-bold text-white mt-2">{value ?? '—'}</p>
    <p className="text-sm text-slate-400">{label}</p>
  </div>
);

// ── Modal Wrapper ──────────────────────────────────────────────────────────────
const Modal = ({ title, open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ── Add User Form ──────────────────────────────────────────────────────────────
const AddUserForm = ({ onSuccess, onClose }) => {
  const [form, setForm]   = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || !form.name.trim()) e.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))             e.email = 'Valid email required';
    if (!passwordRegex.test(form.password))                            e.password = 'Password: 8–16 chars, 1 uppercase, 1 special';
    if (form.address && form.address.length > 400)                     e.address = 'Max 400 characters';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    try {
      await adminAPI.addUser(form);
      toast.success('User created!');
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user';
      toast.error(msg);
      setErrors({ server: msg });
    } finally { setLoading(false); }
  };

  const inp = (field) => ({
    value: form[field],
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
    className: `input-field ${errors[field] ? 'border-red-500/60' : ''}`,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.server && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"><AlertCircle size={15}/>{errors.server}</div>}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
        <input {...inp('name')} type="text" placeholder="Enter full name" />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
        <input {...inp('email')} type="email" placeholder="user@example.com" />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
        <input {...inp('password')} type="password" placeholder="8–16 chars, 1 uppercase, 1 special" />
        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Address (optional)</label>
        <textarea {...inp('address')} rows={2} placeholder="Address" className={`input-field resize-none ${errors.address ? 'border-red-500/60' : ''}`} />
        {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
          <option value="user">Normal User</option>
          <option value="store_owner">Store Owner</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto block"/> : 'Create User'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
      </div>
    </form>
  );
};

// ── Add Store Form ─────────────────────────────────────────────────────────────
const AddStoreForm = ({ onSuccess, onClose }) => {
  const [form, setForm]     = useState({ name: '', email: '', address: '', ownerId: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                            e.name    = 'Store name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))             e.email   = 'Valid email required';
    if (!form.address.trim())                                         e.address = 'Address is required';
    else if (form.address.length > 400)                               e.address = 'Max 400 characters';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    try {
      const payload = { ...form, ownerId: form.ownerId ? Number(form.ownerId) : undefined };
      await adminAPI.addStore(payload);
      toast.success('Store created!');
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create store';
      toast.error(msg);
      setErrors({ server: msg });
    } finally { setLoading(false); }
  };

  const inp = (field) => ({
    value: form[field],
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
    className: `input-field ${errors[field] ? 'border-red-500/60' : ''}`,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.server && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"><AlertCircle size={15}/>{errors.server}</div>}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Store Name</label>
        <input {...inp('name')} type="text" placeholder="Store name" />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Store Email</label>
        <input {...inp('email')} type="email" placeholder="store@example.com" />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
        <textarea {...inp('address')} rows={2} placeholder="Store address" className={`input-field resize-none ${errors.address ? 'border-red-500/60' : ''}`} />
        {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Owner ID (optional)</label>
        <input {...inp('ownerId')} type="number" placeholder="Store owner user ID" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto block"/> : 'Create Store'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
      </div>
    </form>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [stores, setStores]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // 'addUser' | 'addStore'
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'stores'

  // Filters
  const [userFilters, setUserFilters]   = useState({ name: '', email: '', address: '', role: '', sortBy: 'createdAt', order: 'ASC' });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '', sortBy: 'name', order: 'ASC' });

  const fetchStats = useCallback(async () => {
    const res = await adminAPI.getDashboard();
    setStats(res.data);
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await adminAPI.getUsers(userFilters);
    setUsers(res.data.users);
  }, [userFilters]);

  const fetchStores = useCallback(async () => {
    const res = await adminAPI.getStores(storeFilters);
    setStores(res.data.stores);
  }, [storeFilters]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try { await Promise.all([fetchStats(), fetchUsers(), fetchStores()]); }
      catch (err) { toast.error('Failed to load dashboard data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStores(); }, [fetchStores]);

  const userColumns = [
    { key: 'name',    label: 'Name',    sortable: true },
    { key: 'email',   label: 'Email',   sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role',    label: 'Role',    sortable: true, render: (row) => <span className={`badge-${row.role}`}>{row.role}</span> },
  ];

  const storeColumns = [
    { key: 'name',          label: 'Name',    sortable: true },
    { key: 'email',         label: 'Email',   sortable: true },
    { key: 'address',       label: 'Address', sortable: true },
    { key: 'averageRating', label: 'Avg Rating', render: (row) => row.dataValues?.averageRating ? `⭐ ${parseFloat(row.dataValues.averageRating).toFixed(1)}` : '—' },
  ];

  if (loading) return <><Navbar /><LoadingSpinner /></>;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Manage users, stores, and platform activity</p>
          </div>
          <div className="flex gap-3">
            <button id="btn-add-user"  onClick={() => setModal('addUser')}  className="btn-primary flex items-center gap-2 text-sm"><Plus size={16}/>Add User</button>
            <button id="btn-add-store" onClick={() => setModal('addStore')} className="btn-secondary flex items-center gap-2 text-sm"><Plus size={16}/>Add Store</button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <StatCard icon={Users} label="Total Users"   value={stats?.totalUsers}   color="bg-blue-500/20 text-blue-400" />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <StatCard icon={Store} label="Total Stores"  value={stats?.totalStores}  color="bg-purple-500/20 text-purple-400" />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
            <StatCard icon={Star}  label="Total Ratings" value={stats?.totalRatings} color="bg-amber-500/20 text-amber-400" />
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <div className="flex border-b border-slate-700/50">
            {['users', 'stores'].map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {/* User Filters */}
            {activeTab === 'users' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <input className="input-field text-sm" placeholder="Filter by name" value={userFilters.name} onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })} />
                  <input className="input-field text-sm" placeholder="Filter by email" value={userFilters.email} onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })} />
                  <input className="input-field text-sm" placeholder="Filter by address" value={userFilters.address} onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })} />
                  <select className="input-field text-sm" value={userFilters.role} onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}>
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="store_owner">Store Owner</option>
                  </select>
                </div>
                <SortableTable
                  columns={userColumns}
                  data={users}
                  sortBy={userFilters.sortBy}
                  order={userFilters.order}
                  onSort={(key, ord) => setUserFilters({ ...userFilters, sortBy: key, order: ord })}
                  emptyMessage="No users found matching filters."
                />
              </>
            )}

            {/* Store Filters */}
            {activeTab === 'stores' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input className="input-field text-sm" placeholder="Filter by name" value={storeFilters.name} onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })} />
                  <input className="input-field text-sm" placeholder="Filter by email" value={storeFilters.email} onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })} />
                  <input className="input-field text-sm" placeholder="Filter by address" value={storeFilters.address} onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })} />
                </div>
                <SortableTable
                  columns={storeColumns}
                  data={stores}
                  sortBy={storeFilters.sortBy}
                  order={storeFilters.order}
                  onSort={(key, ord) => setStoreFilters({ ...storeFilters, sortBy: key, order: ord })}
                  emptyMessage="No stores found matching filters."
                />
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <Modal title="Add New User" open={modal === 'addUser'} onClose={() => setModal(null)}>
        <AddUserForm onSuccess={() => { setModal(null); fetchUsers(); fetchStats(); }} onClose={() => setModal(null)} />
      </Modal>
      <Modal title="Add New Store" open={modal === 'addStore'} onClose={() => setModal(null)}>
        <AddStoreForm onSuccess={() => { setModal(null); fetchStores(); fetchStats(); }} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
};

export default AdminDashboard;
