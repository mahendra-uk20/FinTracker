import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Settings } from 'lucide-react';
import { INCOME_CATEGORIES, IncomeCategoryEntity, Income } from '../types';
import { addIncome, updateIncome } from '../services/incomeService';
import { subscribeToIncomeCategories } from '../services/categoryService';
import { motion } from 'motion/react';
import CategoryManager from './CategoryManager';

interface IncomeFormProps {
  onClose?: () => void;
  editData?: Income | null;
}

export default function IncomeForm({ onClose, editData }: IncomeFormProps) {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Salary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategories, setCustomCategories] = useState<IncomeCategoryEntity[]>([]);
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToIncomeCategories(setCustomCategories);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (editData) {
      setSource(editData.source);
      setAmount(editData.amount.toString());
      setCategory(editData.category);
      setDate(editData.date);
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editData) {
        await updateIncome(editData.id, {
          source,
          amount: parseFloat(amount),
          category,
          date,
        });
      } else {
        await addIncome({
          source,
          amount: parseFloat(amount),
          category,
          date,
        });
      }
      setSource('');
      setAmount('');
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save income:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isManagingCategories) {
    return <CategoryManager onClose={() => setIsManagingCategories(false)} />;
  }

  const allCategories = [...INCOME_CATEGORIES, ...customCategories.map(c => c.name)];

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          {editData ? 'Modify Income' : 'Record Income'}
        </h3>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
            <X size={20} />
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Source Name</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
            placeholder="e.g. Monthly Salary"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold text-slate-700"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Date Received</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium text-slate-500"
              required
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Category</label>
            <button 
              type="button"
              onClick={() => setIsManagingCategories(true)}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              <Settings size={12} />
              Manage
            </button>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold text-slate-600 appearance-none cursor-pointer"
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:shadow-none ${editData ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'} text-white`}
        >
          {isSubmitting ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            editData ? <Save size={20} /> : <Plus size={20} />
          )}
          {isSubmitting ? 'Processing...' : (editData ? 'Update Income' : 'Add Income')}
        </motion.button>
      </form>
    </div>
  );
}

