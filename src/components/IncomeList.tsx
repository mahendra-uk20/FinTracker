import React from 'react';
import { Trash2, Edit2, ArrowUpRight } from 'lucide-react';
import { Income } from '../types';
import { deleteIncome } from '../services/incomeService';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface IncomeListProps {
  incomeList: Income[];
  onEdit: (income: Income) => void;
}

export default function IncomeList({ incomeList, onEdit }: IncomeListProps) {
  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this income record?')) {
      try {
        await deleteIncome(id);
      } catch (error) {
        console.error('Failed to delete income:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Income Records</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Date</th>
              <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Source</th>
              <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Category</th>
              <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Amount</th>
              <th className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence initial={false}>
              {incomeList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 text-sm font-medium italic">
                    No income records found.
                  </td>
                </tr>
              ) : (
                incomeList.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-4 whitespace-nowrap text-[13px] font-mono text-slate-400">
                      {format(new Date(item.date), 'yyyy-MM-dd')}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] font-semibold text-slate-700 underline decoration-slate-100 decoration-2 underline-offset-4 group-hover:decoration-emerald-100 transition-all">
                          {item.source}
                        </span>
                        <ArrowUpRight size={12} className="text-emerald-400" />
                      </div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-right font-bold tabular-nums text-emerald-600">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 p-2 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
