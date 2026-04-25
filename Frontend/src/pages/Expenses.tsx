import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { Download, Receipt } from 'lucide-react';

const CATEGORIES = [
  { value: 'Food', label: 'Food' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Housing', label: 'Housing' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Salary', label: 'Salary' },
  { value: 'Other', label: 'Other' }
];

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Filter State
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));

  const currency = user?.currency || 'INR';

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses/');
      setExpenses(res.data);
    } catch (err: any) {
      // 401 is handled by the axios interceptor (auto-redirect to login)
      if (err?.response?.status !== 401) {
        toast.error('Failed to load transactions');
      }
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      amount: parseFloat(amount),
      description,
      category,
      type,
      date
    };

    try {
      if (isEditing !== null) {
        await api.put(`/expenses/${isEditing}`, payload);
        toast.success('Transaction updated');
      } else {
        await api.post('/expenses/', payload);
        toast.success('Transaction added');
      }
      setIsEditing(null);
      resetForm();
      // Force reload to ensure everything is fresh
      window.location.reload();
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        toast.error(isEditing ? 'Failed to update' : 'Failed to add transaction');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Transaction deleted');
      // Force reload
      window.location.reload();
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        toast.error('Failed to delete');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = filteredExpenses.map(e => [
      e.date,
      e.description,
      e.category,
      e.type,
      e.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${filterMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (expense: any) => {
    setIsEditing(expense.id);
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setCategory(expense.category);
    setType(expense.type);
    setDate(expense.date);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(null);
    setAmount('');
    setDescription('');
    setCategory('Food');
    setType('expense');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    if (!filterMonth) return expenses;
    const [fYear, fMonth] = filterMonth.split('-');
    return expenses.filter(e => {
      if (!e.date) return false;
      const d = parseISO(e.date);
      return d.getFullYear() === parseInt(fYear) && (d.getMonth() + 1) === parseInt(fMonth);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filterMonth]);

  // Summaries
  const totalIncome = filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track and categorize your income and spending.</p>
        </div>
        
        {/* Month Filter & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="text-sm text-slate-500 dark:text-slate-400 pl-2">Period:</label>
            <input 
              type="month" 
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all"
            title="Export to CSV"
          >
            <Download size={18} />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </header>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl flex flex-col justify-center items-center shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Total Income</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome, currency)}</span>
        </div>
        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl flex flex-col justify-center items-center shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Total Expense</span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalExpense, currency)}</span>
        </div>
        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl flex flex-col justify-center items-center shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Net Balance</span>
          <span className={`text-2xl font-bold ${netBalance >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-red-500 dark:text-red-400'}`}>
            {formatCurrency(netBalance, currency)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form */}
        <div className="xl:col-span-1 order-2 xl:order-1">
          <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h3>
              {isEditing && <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white">Cancel</button>}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'expense' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  Expense
                </button>
                <button 
                  type="button" 
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  Income
                </button>
              </div>

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
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="e.g. Lunch or Salary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-white dark:bg-slate-800">{c.label}</option>)}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-medium py-2.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 mt-4 ${isEditing !== null ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-500 hover:bg-indigo-600'}`}
              >
                {isEditing !== null ? <><CheckCircle2 size={18} /> Update Transaction</> : <><Plus size={18} /> Add Transaction</>}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="xl:col-span-2 order-1 xl:order-2">
          <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Transactions List</h3>
            </div>
            
            <div className="divide-y divide-slate-200 dark:divide-slate-700/50">
              {filteredExpenses.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                  <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-full mb-4 text-slate-400 dark:text-slate-700">
                    <Receipt size={32} />
                  </div>
                  No transactions found for this period.
                </div>
              ) : (
                filteredExpenses.map(expense => {
                  const isIncome = expense.type === 'income';

                  return (
                    <div key={expense.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-inner ${isIncome ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
                          {expense.category[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200 text-lg">{expense.description}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-500">{expense.category} • {expense.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <p className={`font-bold text-lg ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(expense.amount, currency)}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(expense)}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            aria-label="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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

export default Expenses;
