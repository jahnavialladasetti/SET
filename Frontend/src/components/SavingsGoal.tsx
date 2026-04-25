import React, { useState, useEffect } from 'react';
import api from '../api';
import { Target, TrendingUp, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils';
import toast from 'react-hot-toast';

interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
}

const SavingsGoal = ({ currency }: { currency: string }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals/');
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/goals/', {
        name,
        target_amount: parseFloat(target),
        current_amount: parseFloat(current) || 0
      });
      toast.success('Goal added!');
      setIsAdding(false);
      resetForm();
      fetchGoals();
    } catch (err) {
      toast.error('Failed to add goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setName('');
    setTarget('');
    setCurrent('');
  };

  return (
    <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-xl h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Target className="text-indigo-600 dark:text-indigo-400" size={24} />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Savings Goals</h3>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <input
            type="text"
            required
            placeholder="Goal Name (e.g. New Car)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              required
              placeholder="Target"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <input
              type="number"
              placeholder="Current"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium transition-all"
          >
            Save Goal
          </button>
        </form>
      )}

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {goals.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4 italic">No goals yet. Set one to start saving!</p>
        ) : (
          goals.map(goal => {
            const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            return (
              <div key={goal.id} className="space-y-2 group">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{goal.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{formatCurrency(goal.current_amount, currency)} / {formatCurrency(goal.target_amount, currency)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{Math.round(progress)}%</span>
                    <button onClick={() => handleDelete(goal.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SavingsGoal;
