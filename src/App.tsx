/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  signInWithGoogle, 
  logOut, 
  auth 
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { subscribeToExpenses } from './services/expenseService';
import { subscribeToIncome } from './services/incomeService';
import { subscribeToIncomeCategories } from './services/categoryService';
import { Expense, Income, FilterState, IncomeCategoryEntity } from './types';
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  PiggyBank, 
  CreditCard,
  User as UserIcon,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Landmark,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isAfter, isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';

// Components
import ExpenseForm from './components/ExpenseForm';
import IncomeForm from './components/IncomeForm';
import ExpenseList from './components/ExpenseList';
import IncomeList from './components/IncomeList';
import DashboardCharts from './components/DashboardCharts';
import KPICards from './components/KPICards';
import FinanceFilters from './components/FinanceFilters';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategoryEntity[]>([]);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editIncome, setEditIncome] = useState<Income | null>(null);
  const [view, setView] = useState<'expenses' | 'income'>('expenses');

  const exportToCSV = () => {
    const expensesHeader = "Type,Item,Amount,Category,Date\n";
    const expensesRows = expenses.map(e => `"${e.item.replace(/"/g, '""')}",${e.amount},"${e.category}",${e.date}`).join("\n");
    
    const incomeHeader = "\nType,Source,Amount,Category,Date\n";
    const incomeRows = income.map(i => `"${i.source.replace(/"/g, '""')}",${i.amount},"${i.category}",${i.date}`).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + expensesHeader + expensesRows + incomeHeader + incomeRows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FinTrack_Data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const handleEditIncome = (income: Income) => {
    setEditIncome(income);
    setIsIncomeFormOpen(true);
  };
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeExpenses = subscribeToExpenses((data) => {
        setExpenses(data);
      });
      const unsubscribeIncome = subscribeToIncome((data) => {
        setIncome(data);
      });
      const unsubscribeCategories = subscribeToIncomeCategories((data) => {
        setIncomeCategories(data);
      });
      return () => {
        unsubscribeExpenses();
        unsubscribeIncome();
        unsubscribeCategories();
      };
    } else {
      setExpenses([]);
      setIncome([]);
    }
  }, [user]);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.item.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'All' || expense.category === filters.category;
    
    let matchesDate = true;
    if (filters.startDate) {
      matchesDate = matchesDate && isAfter(parseISO(expense.date), startOfDay(parseISO(filters.startDate)));
    }
    if (filters.endDate) {
      matchesDate = matchesDate && isBefore(parseISO(expense.date), endOfDay(parseISO(filters.endDate)));
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  const filteredIncome = income.filter(item => {
    const matchesSearch = item.source.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'All' || item.category === filters.category;
    
    let matchesDate = true;
    if (filters.startDate) {
      matchesDate = matchesDate && isAfter(parseISO(item.date), startOfDay(parseISO(filters.startDate)));
    }
    if (filters.endDate) {
      matchesDate = matchesDate && isBefore(parseISO(item.date), endOfDay(parseISO(filters.endDate)));
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <PiggyBank className="text-blue-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FinTrack</h1>
          <p className="text-gray-500 mb-8">Personal Finance & Expense Automation System. Real-time insights, cross-device.</p>
          
          <button
            onClick={signInWithGoogle}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-gray-200"
          >
            <ShieldCheck size={20} />
            Sign in with Google
          </button>
          
          <div className="mt-8 flex items-center justify-center gap-4 text-gray-400 text-xs font-semibold uppercase tracking-widest">
            <span>Secure</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>Real-time</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>Responsive</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 shrink-0">
        <div className="p-8 border-b border-slate-100 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <PiggyBank size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Finance<span className="text-indigo-600">Pro</span></h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Live Sync</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl transition-all font-semibold shadow-sm shadow-indigo-50/50">
            <LayoutDashboard size={20} />
            <span className="text-sm">Dashboard</span>
          </a>
          <button 
            onClick={() => setIsExpenseFormOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all group"
          >
            <PlusCircle size={20} className="group-hover:text-indigo-600 transition-colors" />
            <span className="text-sm font-medium">Add expense</span>
          </button>
          <button 
            onClick={() => setIsIncomeFormOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all group"
          >
            <TrendingUp size={20} className="group-hover:text-emerald-600 transition-colors" />
            <span className="text-sm font-medium">Add income</span>
          </button>
          <button 
            onClick={exportToCSV}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all group"
          >
            <Download size={20} className="group-hover:text-blue-600 transition-colors" />
            <span className="text-sm font-medium">Download Data (CSV)</span>
          </button>
        </nav>

        <div className="p-4 mx-4 mb-4 bg-slate-900 rounded-2xl text-white shadow-2xl shadow-slate-200">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 px-1">PersonalFinanceDB</p>
          <div className="flex items-center gap-3 mb-4 px-1">
             <ShieldCheck size={18} className="text-indigo-400" />
             <span className="text-sm font-semibold">Active Integrity</span>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between items-center text-[11px] mb-1 font-medium px-1">
               <span className="text-slate-400 italic">SQL Trigger Simulation</span>
               <span className="text-emerald-400 text-[10px] font-bold">READY</span>
             </div>
             <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: [-150, 300] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-1/2 bg-indigo-500 h-full blur-sm opacity-50"
                />
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 rounded-full border-2 border-white shadow-sm" />
              ) : (
                <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                  <UserIcon size={18} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[100px] leading-none">{user.displayName}</span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Premium User</span>
              </div>
            </div>
            <button 
              onClick={logOut}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <PiggyBank size={18} className="text-white" />
          </div>
          <span className="font-bold tracking-tight">FinancePro</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsExpenseFormOpen(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <PlusCircle size={20} />
          </button>
          <button onClick={() => setIsIncomeFormOpen(true)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp size={20} />
          </button>
          <button onClick={exportToCSV} className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Download size={20} />
          </button>
          <button onClick={logOut} className="p-2 text-slate-400">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <header className="px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">PersonalFinanceDB</span>
              <span className="text-slate-300">/</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">Dashboard</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Account Overview
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsIncomeFormOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
            >
              <TrendingUp size={20} />
              Add Income
            </button>
            <button
              onClick={() => setIsExpenseFormOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
            >
              <PlusCircle size={20} />
              Add Expense
            </button>
          </div>
        </header>

        <div className="px-8 pb-12">
          {/* KPI Cards */}
          <KPICards expenses={filteredExpenses} income={filteredIncome} />

          {/* Charts Row */}
          <DashboardCharts expenses={filteredExpenses} income={filteredIncome} />

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
                <button 
                  onClick={() => { setView('expenses'); setFilters({ ...filters, category: 'All' }); }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'expenses' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Expenses
                </button>
                <button 
                  onClick={() => { setView('income'); setFilters({ ...filters, category: 'All' }); }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'income' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Income
                </button>
             </div>
          </div>

          <FinanceFilters 
            filters={filters} 
            onFilterChange={setFilters} 
            type={view}
            incomeCategories={incomeCategories}
          />

          {/* Table Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              {view === 'expenses' ? (
                <ExpenseList expenses={filteredExpenses} onEdit={handleEditExpense} />
              ) : (
                <IncomeList incomeList={filteredIncome} onEdit={handleEditIncome} />
              )}
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Financial Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Integration</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">CONNECTED</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Python Worker</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">IDLE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Power BI Sync</span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full">SCHEDULED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Expense Form Modal */}
      <AnimatePresence>
        {isExpenseFormOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpenseFormOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] shadow-2xl overflow-hidden pb-12"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />
              <ExpenseForm 
                onClose={() => { setIsExpenseFormOpen(false); setEditExpense(null); }} 
                editData={editExpense}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Income Form Modal */}
      <AnimatePresence>
        {isIncomeFormOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsIncomeFormOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] shadow-2xl overflow-hidden pb-12"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />
              <IncomeForm 
                onClose={() => { setIsIncomeFormOpen(false); setEditIncome(null); }} 
                editData={editIncome}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
