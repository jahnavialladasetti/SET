import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import api from '../api';
import { ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';

const COLORS = ['#818cf8', '#c084fc', '#f472b6', '#38bdf8', '#fbbf24'];

const Dashboard = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, subRes] = await Promise.all([
          api.get('/expenses/'),
          api.get('/subscriptions/')
        ]);
        setExpenses(expRes.data);
        setSubscriptions(subRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-slate-400">Loading your insights...</div>;

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalMonthlySubs = subscriptions.filter(s => s.billing_cycle === 'monthly').reduce((acc, curr) => acc + curr.amount, 0);
  
  // Group expenses by category for Pie Chart
  const expensesByCategory = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});
  
  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  // Find upcoming subscriptions
  const today = new Date();
  const upcomingSubs = subscriptions.filter(s => {
    const nextDate = new Date(s.next_billing_date);
    const diffTime = Math.abs(nextDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && nextDate >= today;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-100">Overview</h1>
        <p className="text-slate-400 mt-1">Here's your financial summary.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ArrowDownRight size={24} />
            </div>
            <h3 className="text-lg font-medium text-slate-300">Total Expenses</h3>
          </div>
          <p className="text-4xl font-bold text-slate-100">₹{totalExpenses.toFixed(2)}</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <CreditCard size={24} />
            </div>
            <h3 className="text-lg font-medium text-slate-300">Monthly Subs</h3>
          </div>
          <p className="text-4xl font-bold text-slate-100">₹{totalMonthlySubs.toFixed(2)}</p>
          <p className="text-sm text-slate-500 mt-2">Active fixed costs</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-pink-500/20"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
              <ArrowUpRight size={24} />
            </div>
            <h3 className="text-lg font-medium text-slate-300">Due in 7 Days</h3>
          </div>
          <p className="text-4xl font-bold text-slate-100">{upcomingSubs.length}</p>
          <p className="text-sm text-slate-500 mt-2">Bills approaching</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold mb-6 text-slate-200">Expenses by Category</h3>
          {pieData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="rgba(0,0,0,0)"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-72 flex items-center justify-center text-slate-500">
                No expense data yet
             </div>
          )}
        </div>

        {/* Upcoming Bills */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold mb-6 text-slate-200">Upcoming Bills (Next 7 Days)</h3>
          {upcomingSubs.length > 0 ? (
            <div className="space-y-4">
              {upcomingSubs.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                      {sub.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-200">{sub.name}</h4>
                      <p className="text-sm text-slate-500">Due: {sub.next_billing_date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-200">₹{sub.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 capitalize">{sub.billing_cycle}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500">
               No bills due in the next 7 days! 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
