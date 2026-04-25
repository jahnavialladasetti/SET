import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';



const CATEGORIES = ['Entertainment', 'Software', 'Utility', 'Health', 'Other'];

const Subscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');

  const currency = user?.currency || 'INR';

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions/');
      setSubscriptions(res.data);
    } catch (err: any) {
      // 401 is handled by the axios interceptor (auto-redirect to login)
      if (err?.response?.status !== 401) {
        toast.error('Failed to load subscriptions');
      }
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    setLoading(true);

    const payload = {
      name,
      amount: parseFloat(amount),
      billing_cycle: billingCycle,
      start_date: startDate,
      category,
      note
    };

    try {
      if (isEditing !== null) {
        console.log("Updating sub:", isEditing);
        await api.put(`/subscriptions/${isEditing}`, payload);
        toast.success('Subscription updated');
      } else {
        console.log("Creating new sub");
        await api.post('/subscriptions/', payload);
        toast.success('Subscription added');
      }
      setIsEditing(null);
      resetForm();
      fetchSubscriptions();
      // Optional: window.location.reload(); 
    } catch (err: any) {
      console.error("Auth error in sub form:", err);
      if (err?.response?.status !== 401) {
        toast.error(isEditing !== null ? 'Failed to update' : 'Failed to add subscription');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subId: any) => {
    const id = typeof subId === 'object' ? subId.id : subId;
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      console.log("Deleting sub:", id);
      await api.delete(`/subscriptions/${id}`);
      toast.success('Subscription deleted');
      fetchSubscriptions();
      if (isEditing === id) resetForm();
    } catch (err: any) {
      console.error("Delete error:", err);
      if (err?.response?.status !== 401) {
        toast.error('Failed to delete');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Service', 'Amount', 'Cycle', 'Category', 'Next Billing'];
    const rows = subscriptions.map(s => [
      s.name,
      s.amount,
      s.billing_cycle,
      s.category,
      s.next_billing_date
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subscriptions.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (sub: any) => {
    setIsEditing(sub.id);
    setName(sub.name);
    setAmount(sub.amount.toString());
    setBillingCycle(sub.billing_cycle);
    setStartDate(sub.start_date || new Date().toISOString().split('T')[0]);
    setCategory(sub.category || CATEGORIES[0]);
    setNote(sub.note || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(null);
    setName('');
    setAmount('');
    setBillingCycle('monthly');
    setStartDate(new Date().toISOString().split('T')[0]);
    setCategory(CATEGORIES[0]);
    setNote('');
  };

  const today = new Date();
  
  const urgentBills = subscriptions.filter(s => {
    const nextDate = new Date(s.next_billing_date);
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  const totalMonthly = subscriptions.reduce((sum, s) => {
    return sum + (s.billing_cycle === 'monthly' ? s.amount : s.amount / 12);
  }, 0);
  const totalYearly = totalMonthly * 12;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Subscriptions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your recurring bills and subscriptions.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all self-start md:self-center shadow-sm"
        >
          <Download size={18} />
          <span className="text-sm font-medium">Export CSV</span>
        </button>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-500/20 p-6 rounded-2xl flex flex-col items-center justify-center shadow-md dark:shadow-lg">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Monthly Cost</span>
          <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{formatCurrency(totalMonthly, currency)}</span>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col items-center justify-center shadow-md dark:shadow-lg">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Estimated Yearly Cost</span>
          <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{formatCurrency(totalYearly, currency)}</span>
        </div>
      </div>

      {/* Urgency Banner */}
      {urgentBills.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/50 rounded-2xl p-4 flex items-start gap-4 shadow-sm dark:shadow-lg dark:shadow-amber-500/5">
          <div className="text-amber-600 dark:text-amber-400 mt-0.5"><AlertTriangle size={24} /></div>
          <div>
            <h3 className="text-amber-600 dark:text-amber-400 font-semibold text-lg">Action Required</h3>
            <p className="text-slate-600 dark:text-amber-200/80 text-sm mt-1">You have {urgentBills.length} bill(s) due in the next 3 days. Make sure your account is funded.</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              {urgentBills.map(b => (
                <span key={b.id} className="bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs px-2.5 py-1 rounded-md border border-amber-500/20">
                  {b.name} ({b.next_billing_date})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form */}
        <div id="subscription-form" className="xl:col-span-1 order-1">
          <div className={`backdrop-blur-md border rounded-3xl p-8 shadow-2xl transition-all duration-300 sticky top-8 ${isEditing !== null ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/30 dark:border-indigo-500/50 ring-4 ring-indigo-500/5 dark:ring-indigo-500/10' : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{isEditing ? 'Edit Subscription' : 'Add New Bill'}</h3>
              {isEditing && <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white">Cancel</button>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Service Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                  placeholder="e.g. Netflix"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-400 dark:text-slate-500">{currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '¥'}</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="monthly" className="bg-white dark:bg-slate-800">Monthly</option>
                    <option value="quarterly" className="bg-white dark:bg-slate-800">Quarterly</option>
                    <option value="yearly" className="bg-white dark:bg-slate-800">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-white dark:bg-slate-800">{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Billing Date (Start)</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Notes (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none h-20"
                  placeholder="e.g. Shared with family"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-medium py-2.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 mt-4 ${isEditing !== null ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-500 hover:bg-indigo-600'}`}
              >
                {isEditing !== null ? <><CheckCircle2 size={18} /> Update Subscription</> : <><Plus size={18} /> Add Subscription</>}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="xl:col-span-2 order-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscriptions.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center min-h-[400px] justify-center shadow-sm">
                <span className="text-4xl mb-3">🔄</span>
                No active subscriptions found.
              </div>
            ) : (
              subscriptions.map(sub => (
                <div key={sub.id} className="bg-white dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden group">
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-all opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 bg-indigo-500"
                  ></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-500"
                      >
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{sub.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{sub.category || 'Subscription'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 relative z-10">
                      <button 
                        onClick={() => handleEdit(sub)}
                        className="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all border border-slate-200 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900/40"
                        title="Edit"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        className="p-3 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-slate-200 dark:border-slate-700/50 hover:border-red-400 dark:hover:border-red-500/50 bg-white dark:bg-slate-900/40"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-slate-500">Price</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {formatCurrency(sub.amount, currency)} <span className="text-sm font-normal text-slate-500">/{sub.billing_cycle === 'yearly' ? 'yr' : 'mo'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Next Billing</p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mt-1">{sub.next_billing_date}</p>
                      </div>
                    </div>

                    {sub.note && (
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
                        {sub.note}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
