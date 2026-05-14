import React from 'react';
import { Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Expense } from '../types';
import { deleteExpense } from '../services/expenseService';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, onEdit }: ExpenseListProps) {
  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Recent Activity</h3>
        <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Date</th>
              <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Item / Description</th>
              <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Category</th>
              <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Amount</th>
              <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence initial={false}>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 text-sm font-medium italic">
                    No transaction records identified in PersonalFinanceDB.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => {
                  const isHighExposure = expense.amount > 5000;
                  return (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-4 whitespace-nowrap text-[13px] font-mono text-slate-400">
                        {format(new Date(expense.date), 'yyyy-MM-dd')}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="text-[14px] font-semibold text-slate-700 underline decoration-slate-100 decoration-2 underline-offset-4 group-hover:decoration-indigo-100 transition-all">
                            {expense.item}
                          </span>
                          {isHighExposure && (
                            <div className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 text-[9px] font-bold rounded uppercase tracking-tighter shadow-sm animate-pulse">
                              TRIGGER ALERT
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider group-hover:bg-white transition-colors">
                          {expense.category}
                        </span>
                      </td>
                      <td className={`px-8 py-4 whitespace-nowrap text-sm text-right font-bold tabular-nums ${isHighExposure ? 'text-rose-600' : 'text-slate-800'}`}>
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onEdit(expense)}
                            className="text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 p-2 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

