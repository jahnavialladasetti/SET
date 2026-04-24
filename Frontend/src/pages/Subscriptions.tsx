import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, Calendar } from 'lucide-react';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions/');
      setSubscriptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/subscriptions/', {
        name,
        amount: parseFloat(amount),
        billing_cycle: billingCycle,
        start_date: startDate || undefined
      });
      setName('');
      setAmount('');
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-100">Subscriptions</h1>
        <p className="text-slate-400 mt-1">Manage your recurring bills and never miss a payment.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-8">
            <h3 className="text-xl font-semibold mb-6 text-slate-200">Add Subscription</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Service Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="e.g. Netflix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Billing Cycle</label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Start Date / Last Billed</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [color-scheme:dark]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 mt-4"
              >
                <Plus size={18} /> Add Subscription
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-200">Active Subscriptions</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {subscriptions.length === 0 ? (
                <div className="col-span-full p-8 text-center text-slate-500">No active subscriptions.</div>
              ) : (
                subscriptions.map(sub => {
                  const today = new Date();
                  const nextDate = new Date(sub.next_billing_date);
                  const diffTime = nextDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isUpcoming = diffDays >= 0 && diffDays <= 7;

                  return (
                    <div 
                      key={sub.id} 
                      className={`p-5 rounded-2xl border transition-all group relative overflow-hidden ${
                        isUpcoming 
                          ? 'bg-purple-900/20 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                          : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800/80'
                      }`}
                    >
                      {isUpcoming && (
                        <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                          Due in {diffDays} days
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl">
                          {sub.name[0].toUpperCase()}
                        </div>
                        <button 
                          onClick={() => handleDelete(sub.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <h4 className="text-xl font-bold text-slate-200 mb-1">{sub.name}</h4>
                      <p className="text-2xl font-light text-slate-100 mb-4">
                        ${sub.amount.toFixed(2)} <span className="text-sm text-slate-500">/{sub.billing_cycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-950/50 p-2.5 rounded-lg">
                        <Calendar size={16} className="text-purple-400" />
                        <span>Next billing: <span className="text-slate-200 font-medium">{sub.next_billing_date}</span></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
