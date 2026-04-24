import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2 } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses/');
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/expenses/', {
        amount: parseFloat(amount),
        description,
        category
      });
      setAmount('');
      setDescription('');
      fetchExpenses();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['Food', 'Travel', 'Entertainment', 'Housing', 'Utilities', 'Other'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-100">Expenses</h1>
        <p className="text-slate-400 mt-1">Track and categorize your spending.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-8">
            <h3 className="text-xl font-semibold mb-6 text-slate-200">Add New Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="e.g. Lunch at Chipotle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 mt-4"
              >
                <Plus size={18} /> Add Expense
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-200">Recent Transactions</h3>
            </div>
            
            <div className="divide-y divide-slate-700/50">
              {expenses.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No expenses recorded yet.</div>
              ) : (
                expenses.slice().reverse().map(expense => (
                  <div key={expense.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-800/60 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium">
                        {expense.category[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{expense.description}</p>
                        <p className="text-sm text-slate-500">{expense.category} • {expense.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="font-bold text-slate-200">₹{expense.amount.toFixed(2)}</p>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="Delete expense"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
