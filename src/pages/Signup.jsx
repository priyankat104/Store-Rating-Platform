import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

const Signup = () => {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirmPassword: '', address: '', role: 'user' });
  const [errors, setErrors]   = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || !form.name.trim())         e.name    = 'Name is required';
    if (!form.email)                             e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))  e.email   = 'Invalid email format';
    if (!form.password)                          e.password = 'Password is required';
    else if (!passwordRegex.test(form.password)) e.password = 'Password must be 8–16 chars, with 1 uppercase and 1 special character';
    if (form.password !== form.confirmPassword)  e.confirmPassword = 'Passwords do not match';
    if (form.address && form.address.length > 400) e.address = 'Address must be at most 400 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setErrors({});
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await signup(payload);
      toast.success('Account created successfully!');
      const redirectMap = { admin: '/admin', user: '/dashboard', store_owner: '/store-owner' };
      navigate(redirectMap[user.role] || '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(msg);
      setErrors({ server: msg });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, children, error }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-800/20 rounded-full blur-3xl animate-pulse" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="card w-full max-w-lg p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary-600/20 border border-primary-500/30 rounded-2xl flex items-center justify-center mb-4">
            <Store className="text-primary-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-slate-400 text-sm mt-1">Join StoreRate today</p>
        </div>

        {errors.server && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle size={16} /> {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field id="name" label="Full Name" error={errors.name}>
            <input
              id="name"
              type="text"
              className={`input-field ${errors.name ? 'border-red-500/60 focus:ring-red-500' : ''}`}
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          <Field id="email" label="Email address" error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`input-field ${errors.email ? 'border-red-500/60 focus:ring-red-500' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          <Field id="password" label="Password" error={errors.password}>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                className={`input-field pr-10 ${errors.password ? 'border-red-500/60 focus:ring-red-500' : ''}`}
                placeholder="8–16 chars, 1 uppercase, 1 special"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          <Field id="confirmPassword" label="Confirm Password" error={errors.confirmPassword}>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={`input-field ${errors.confirmPassword ? 'border-red-500/60 focus:ring-red-500' : ''}`}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </Field>

          <Field id="address" label="Address (optional)" error={errors.address}>
            <textarea
              id="address"
              rows={2}
              className={`input-field resize-none ${errors.address ? 'border-red-500/60 focus:ring-red-500' : ''}`}
              placeholder="Your address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>

          <Field id="role" label="Account Type" error={errors.role}>
            <select
              id="role"
              className="input-field"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">Normal User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </Field>

          <button
            id="btn-signup"
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
