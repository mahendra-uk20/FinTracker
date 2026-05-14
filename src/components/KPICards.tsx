import React from 'react';
import { Wallet, TrendingUp, AlertTriangle, CreditCard, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Expense, Income } from '../types';
import { startOfMonth, isAfter } from 'date-fns';

interface KPICardsProps {
  expenses: Expense[];
  income: Income[];
}

export default function KPICards({ expenses, income }: KPICardsProps) {
  const currentMonthStart = startOfMonth(new Date());
  
  const currentMonthExpenses = expenses.filter(e => isAfter(new Date(e.date), currentMonthStart));
  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const currentMonthIncome = income.filter(i => isAfter(new Date(i.date), currentMonthStart));
  const totalIncome = currentMonthIncome.reduce((sum, i) => sum + i.amount, 0);
  
  const netSavings = totalIncome - totalSpent;
  const highValueTransactions = currentMonthExpenses.filter(e => e.amount > 5000).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card 
        label="Monthly Income" 
        value={`₹${totalIncome.toLocaleString()}`} 
        icon={<ArrowUpCircle className="text-emerald-500" size={18} />}
        sub="Total earnings this month"
        trend="positive"
      />
      <Card 
        label="Monthly Spent" 
        value={`₹${totalSpent.toLocaleString()}`} 
        icon={<ArrowDownCircle className="text-rose-500" size={18} />}
        sub="Invoiced this month"
        trend="negative"
      />
      <Card 
        label="Net Savings" 
        value={`₹${netSavings.toLocaleString()}`} 
        icon={<TrendingUp className="text-indigo-600" size={18} />}
        sub={netSavings >= 0 ? "Surplus remaining" : "Deficit this month"}
        trend={netSavings >= 0 ? 'positive' : 'negative'}
      />
      <Card 
        label="Anomalies" 
        value={highValueTransactions.toString()} 
        icon={<AlertTriangle className="text-amber-500" size={18} />}
        sub="Triggers > ₹5,000"
        trend="warning"
      />
    </div>
  );
}

function Card({ label, value, icon, sub, trend }: { label: string; value: string; icon: React.ReactNode; sub: string; trend: 'positive' | 'negative' | 'neutral' | 'warning' }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className={`text-2xl font-bold tracking-tight ${trend === 'negative' && label === 'Monthly Spent' ? 'text-rose-600' : trend === 'negative' ? 'text-rose-600' : 'text-slate-800'}`}>
          {value}
        </h3>
        {trend === 'positive' && label === 'Monthly Income' && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>}
      </div>
      <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-tighter">{sub}</p>
    </div>
  );
}
