
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, RefreshCcw, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
    { path: '/subscriptions', label: 'Subscriptions', icon: RefreshCcw },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col transition-all duration-300">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-3xl">💸</span> SpendSense
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-400' : ''} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-800/80">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden text-ellipsis text-sm text-slate-300">
              {user?.email}
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/20">
        <div className="p-8 w-full min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
