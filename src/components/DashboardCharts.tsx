import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from 'recharts';
import { Expense, Income, CATEGORIES } from '../types';
import { format, subDays, isSameDay } from 'date-fns';

interface DashboardChartsProps {
  expenses: Expense[];
  income: Income[];
}

const COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'
];

export default function DashboardCharts({ expenses, income }: DashboardChartsProps) {
  // Category data (combined for pie, or keep separate? Let's show expenses by category)
  const categoryData = CATEGORIES.map(category => {
    const total = expenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name: category, value: total };
  }).filter(data => data.value > 0);

  // Daily trend data (last 7 days)
  const trendData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayExpenseTotal = expenses
      .filter(e => isSameDay(new Date(e.date), date))
      .reduce((sum, e) => sum + e.amount, 0);
    const dayIncomeTotal = income
      .filter(i => isSameDay(new Date(i.date), date))
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      date: format(date, 'MMM dd'),
      expense: dayExpenseTotal,
      income: dayIncomeTotal
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Category Donut Chart */}
      <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 h-[380px] flex flex-col hover:shadow-md transition-shadow">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Expense Distribution</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={70}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
                animationDuration={1500}
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Total']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 600 }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Momentum Area Chart */}
      <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 h-[380px] flex flex-col hover:shadow-md transition-shadow">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Finance Momentum (In vs Out)</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                tickFormatter={(value) => `₹${value}`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '12px' }}
                itemStyle={{ fontSize: '11px', fontWeight: 600 }}
              />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Area 
                type="monotone" 
                dataKey="income" 
                name="Income"
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                strokeWidth={3}
                animationDuration={2000}
                dot={{ r: 3, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                name="Expense"
                stroke="#EF4444" 
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                strokeWidth={3}
                animationDuration={2000}
                dot={{ r: 3, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
