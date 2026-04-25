import { Link } from 'react-router-dom';
import { Wallet, PieChart, ArrowRight, TrendingUp, Bell } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Wallet size={24} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            SET
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-sm font-medium text-slate-600">The smarter way to manage your money</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">SET</span>
          <span className="text-3xl md:text-5xl text-slate-800 mt-6 block font-bold">
            The <span className="text-indigo-500">S</span>mart <span className="text-purple-500">E</span>xpense <span className="text-pink-500">T</span>racker
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          SET isn't just an expense tracker. It's your personal financial dashboard designed to give you complete clarity, smart insights, and absolute control over your wealth.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <Link to="/signup" className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1">
            Start for free <ArrowRight size={20} />
          </Link>
        </div>

      </main>

      {/* Features Section */}
      <section className="relative z-10 bg-white py-32 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We've built the most intuitive tools to help you understand your spending habits and grow your savings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                <PieChart size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Visual Analytics</h3>
              <p className="text-slate-600 leading-relaxed">
                See exactly where your money goes with beautiful, interactive charts. Categorize expenses and spot trends instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 mb-6">
                <Bell size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Subscription Manager</h3>
              <p className="text-slate-600 leading-relaxed">
                Never pay for an unused subscription again. We track your recurring bills and notify you before you are charged.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Insights</h3>
              <p className="text-slate-600 leading-relaxed">
                Our algorithm analyzes your spending behavior and provides actionable alerts to keep you under your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Wallet size={18} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SET</span>
          </div>
          <p className="text-sm">Built with passion for better financial freedom.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
