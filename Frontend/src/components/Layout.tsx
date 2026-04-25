
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, RefreshCcw, LogOut, Settings, X, Save, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Layout = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/expenses', label: 'Expenses', icon: Receipt },
    { path: '/dashboard/subscriptions', label: 'Subscriptions', icon: RefreshCcw },
  ];

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [budget, setBudget] = useState('2000');
  const { updateUserProfile } = useAuth();

  // Sync form with latest user data every time the modal opens
  useEffect(() => {
    if (isSettingsOpen && user) {
      setName(user.name || '');
      setCurrency(user.currency || 'INR');
      setBudget(user.monthly_budget?.toString() || '2000');
    }
  }, [isSettingsOpen, user]);

  const handleSaveSettings = async () => {
    try {
      await updateUserProfile({
        name,
        currency,
        monthly_budget: parseFloat(budget)
      });
      toast.success('Settings saved!');
      setIsSettingsOpen(false);
    } catch (e) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 pb-16 md:pb-0 relative overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700/50 flex-col transition-all duration-300 z-10">
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Wallet className="text-indigo-500 dark:text-indigo-400" size={28} /> SET
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
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-500 dark:text-indigo-400' : ''} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">


          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-100 dark:bg-slate-800/80">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden text-ellipsis text-sm text-slate-600 dark:text-slate-300">
              {user?.email}
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 mb-1"
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-indigo-900/20 z-0">
        <div className="p-4 md:p-8 w-full min-h-full pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700/50 flex justify-around items-center p-3 z-50">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
              <Icon size={24} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          )
        })}

        <button onClick={() => setIsSettingsOpen(true)} className="flex flex-col items-center p-2 rounded-lg text-slate-500 dark:text-slate-400">
          <Settings size={24} />
          <span className="text-[10px] mt-1">Settings</span>
        </button>
      </nav>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Settings size={20} className="text-indigo-500 dark:text-indigo-400" /> User Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Your Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Monthly Budget</label>
                <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="2000" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Currency Setup</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none">
                  <option value="INR">₹ (INR)</option>
                  <option value="USD">$ (USD)</option>
                  <option value="EUR">€ (EUR)</option>
                  <option value="GBP">£ (GBP)</option>
                  <option value="JPY">¥ (JPY)</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleSaveSettings} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"><Save size={18} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
