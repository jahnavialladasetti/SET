import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api';
import { ArrowUpRight, ArrowDownRight, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import Spinner from '../components/Spinner';
import SavingsGoal from '../components/SavingsGoal';
import { useTheme } from '../contexts/ThemeContext';
import { Lightbulb, Info } from 'lucide-react';

const COLORS = ['#818cf8', '#c084fc', '#f472b6', '#38bdf8', '#fbbf24', '#34d399', '#f87171'];

const Dashboard = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { theme } = useTheme();

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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size={40} /></div>;

  const currency = user?.currency || 'INR';

  // Calculations
  const allExpenses = expenses.filter(e => e.type !== 'income');
  const allIncomes = expenses.filter(e => e.type === 'income');

  const totalExpenses = allExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = allIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Current Month calculations for budget
  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);

  const currentMonthExpenses = allExpenses.filter(e => {
    if (!e.date) return false;
    const expenseDate = parseISO(e.date);
    return isWithinInterval(expenseDate, { start: currentMonthStart, end: currentMonthEnd });
  }).reduce((acc, curr) => acc + curr.amount, 0);

  const budget = user?.monthly_budget || 2000;
  const budgetPercentage = Math.min((currentMonthExpenses / budget) * 100, 100);

  // Group expenses by category for Pie Chart (Current Month)
  const expensesByCategory = allExpenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});
  
  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  })).sort((a, b) => b.value - a.value);

  // Area Chart Data (Last 6 Months)
  const areaData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(today, 5 - i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    
    const monthExpenses = allExpenses.filter(e => e.date && isWithinInterval(parseISO(e.date), { start, end })).reduce((sum, e) => sum + e.amount, 0);
    const monthIncome = allIncomes.filter(e => e.date && isWithinInterval(parseISO(e.date), { start, end })).reduce((sum, e) => sum + e.amount, 0);

    return {
      name: format(d, 'MMM'),
      Expense: monthExpenses,
      Income: monthIncome
    };
  });

  // Find upcoming subscriptions
  const upcomingSubs = subscriptions.filter(s => {
    const nextDate = new Date(s.next_billing_date);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Smart Insights Logic
  const generateInsights = () => {
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));

    const lastMonthExpenses = allExpenses.filter(e => {
      if (!e.date) return false;
      const d = parseISO(e.date);
      return isWithinInterval(d, { start: lastMonthStart, end: lastMonthEnd });
    });

    const insights: any[] = [];

    // Category Insight
    Object.keys(expensesByCategory).forEach(cat => {
      const lastMonthCatTotal = lastMonthExpenses
        .filter(e => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0);
      
      if (lastMonthCatTotal > 0) {
        const diff = ((expensesByCategory[cat] - lastMonthCatTotal) / lastMonthCatTotal) * 100;
        if (Math.abs(diff) > 20) {
          insights.push({
            type: diff > 0 ? 'warning' : 'success',
            text: `You spent ${Math.abs(Math.round(diff))}% ${diff > 0 ? 'more' : 'less'} on ${cat} compared to last month.`
          });
        }
      }
    });

    // Budget Insight
    if (budgetPercentage > 100) {
      insights.push({ type: 'danger', text: "You've exceeded your monthly budget!" });
    } else if (budgetPercentage > 80) {
      insights.push({ type: 'warning', text: "You've used over 80% of your budget." });
    }

    return insights;
  };

  const insights = generateInsights();

  const displayName = user?.name || user?.email.split('@')[0] || 'User';

  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridStroke = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{getGreeting()}, {displayName}</h1>
        <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your money today.</p>
      </header>

      {/* KPI Snapshots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Balance */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm dark:shadow-xl relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Balance</p>
              <h3 className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-red-500 dark:text-red-400'}`}>
                {formatCurrency(totalIncome - totalExpenses, currency)}
              </h3>
            </div>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm dark:shadow-xl relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowDownRight size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Income</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totalIncome, currency)}</h3>
            </div>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm dark:shadow-xl relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Spend</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totalExpenses, currency)}</h3>
            </div>
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm dark:shadow-xl relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bills Due (7d)</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{upcomingSubs.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Large Trend Chart */}
          <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 shadow-sm dark:shadow-xl">
            <h3 className="text-xl font-semibold mb-8 text-slate-800 dark:text-slate-200">Income vs Expenses Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="name" stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => {
                    const prefix = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '¥';
                    return `${prefix}${val}`;
                  }} />
                  <RechartsTooltip  
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '0.75rem', color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
                    itemStyle={{ color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
                  />
                  <Area type="monotone" dataKey="Income" stroke="#34d399" fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="Expense" stroke="#818cf8" fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Category Breakdown */}
            <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-xl">
              <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200">Category Breakdown</h3>
              {pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="rgba(0,0,0,0)"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '0.75rem', color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
                        itemStyle={{ color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
                        formatter={(value: any) => formatCurrency(Number(value), currency)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500 italic text-sm">
                  No expense data available for this month.
                </div>
              )}
            </div>

            {/* Upcoming Bills */}
            <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-xl">
              <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200">Upcoming Bills</h3>
              {upcomingSubs.length > 0 ? (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {upcomingSubs.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700/30 group hover:border-slate-400/50 dark:hover:border-slate-500/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800 dark:text-slate-200">{sub.name}</h4>
                          <p className="text-xs text-slate-500">{sub.next_billing_date}</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{formatCurrency(sub.amount, currency)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
                  <div className="bg-slate-100 dark:bg-slate-900/50 p-3 rounded-full">
                    <Calendar size={24} className="text-slate-400 dark:text-slate-600" />
                  </div>
                  <p className="text-sm">No bills due in 7 days!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity - Full Width of Main Column */}
          <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200">Recent Transactions</h3>
            <div className="divide-y divide-slate-200 dark:divide-slate-700/30">
              {expenses.length === 0 ? (
                <div className="py-12 text-center text-slate-500">No activity recorded yet.</div>
              ) : (
                expenses.slice().reverse().slice(0, 5).map(expense => (
                  <div key={expense.id} className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors px-2 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${expense.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
                        {expense.category[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{expense.description}</p>
                        <p className="text-xs text-slate-500">{expense.category} • {expense.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${expense.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount, currency)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Budget Overview */}
          <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Budget Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Monthly Spend</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(currentMonthExpenses, currency)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-700/50">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${budgetPercentage > 90 ? 'bg-red-500' : budgetPercentage > 75 ? 'bg-orange-500' : 'bg-indigo-500'}`} 
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                You have {formatCurrency(Math.max(budget - currentMonthExpenses, 0), currency)} left this month.
              </p>
            </div>
          </div>

          {/* Smart Insights */}
          <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="text-amber-500 dark:text-amber-400" size={20} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Smart Insights</h3>
            </div>
            <div className="space-y-3">
              {insights.length === 0 ? (
                <p className="text-slate-500 text-sm italic text-center py-4">No new insights. Everything looks good!</p>
              ) : (
                insights.map((insight, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border text-sm flex gap-3 ${
                    insight.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' :
                    insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <Info size={18} className="shrink-0 mt-0.5" />
                    <span>{insight.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <SavingsGoal currency={currency} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
