import React, { useState, useEffect } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { CATEGORIES, ExpenseCategory, Expense } from '../types';
import { addExpense, updateExpense } from '../services/expenseService';
import { motion, AnimatePresence } from 'motion/react';

interface ExpenseFormProps {
  onClose?: () => void;
  editData?: Expense | null;
}

export default function ExpenseForm({ onClose, editData }: ExpenseFormProps) {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setItem(editData.item);
      setAmount(editData.amount.toString());
      setCategory(editData.category);
      setDate(editData.date);
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !amount || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editData) {
        await updateExpense(editData.id, {
          item,
          amount: parseFloat(amount),
          category,
          date,
        });
      } else {
        await addExpense({
          item,
          amount: parseFloat(amount),
          category,
          date,
        });
      }
      setItem('');
      setAmount('');
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          {editData ? 'Modify Transaction' : 'Post Transaction'}
        </h3>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
            <X size={20} />
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Item / Description</label>
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
            placeholder="e.g. Swiggy Gourmet"
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
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm font-bold text-slate-700"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Transaction Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium text-slate-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Classification</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold text-slate-600 appearance-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:shadow-none ${editData ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'} text-white`}
        >
          {isSubmitting ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            editData ? <Save size={20} /> : <Plus size={20} />
          )}
          {isSubmitting ? 'Processing...' : (editData ? 'Update Transaction' : 'Commit Transaction')}
        </motion.button>
      </form>
    </div>
  );
}

