import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Store, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    admin: 'Administrator',
    user: 'User',
    store_owner: 'Store Owner',
  };

  const roleBadge = {
    admin: 'badge-admin',
    user: 'badge-user',
    store_owner: 'badge-store_owner',
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Store className="text-primary-400" size={24} />
        <span className="text-lg font-bold text-white tracking-tight">
          Store<span className="text-primary-400">Rate</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-200">{user.name}</span>
              <span className={roleBadge[user.role]}>{roleLabel[user.role]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors duration-200 text-sm font-medium"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
