import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Save, Tag } from 'lucide-react';
import { IncomeCategoryEntity, INCOME_CATEGORIES } from '../types';
import { 
  addIncomeCategory, 
  updateIncomeCategory, 
  deleteIncomeCategory, 
  subscribeToIncomeCategories 
} from '../services/categoryService';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryManagerProps {
  onClose: () => void;
}

export default function CategoryManager({ onClose }: CategoryManagerProps) {
  const [categories, setCategories] = useState<IncomeCategoryEntity[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToIncomeCategories(setCategories);
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addIncomeCategory(newName.trim());
      setNewName('');
    } catch (error) {
      console.error('Failed to add category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateIncomeCategory(id, editName.trim());
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete category "${name}"? This will not remove associations from existing income records.`)) {
      try {
        await deleteIncomeCategory(id);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const startEditing = (category: IncomeCategoryEntity) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 max-w-md w-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Tag size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Income Categories</h3>
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleAdd} className="mb-8">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Add New Category</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
            placeholder="e.g. Consulting"
            required
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isSubmitting}
            className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            <Plus size={20} />
          </motion.button>
        </div>
      </form>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Your Categories</h4>
        
        {/* Default Categories (Non-editable for now to prevent breaking things, or just show them as info) */}
        <div className="space-y-2 mb-4">
          {INCOME_CATEGORIES.map((cat) => (
             <div key={cat} className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
               <span className="text-sm font-medium text-slate-400 italic">{cat} (Default)</span>
             </div>
          ))}
        </div>

        <AnimatePresence mode="popLayout">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl group hover:border-emerald-200 transition-all"
            >
              {editingId === cat.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                  />
                  <button
                    onClick={() => handleUpdate(cat.id)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(cat)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {categories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400">No custom categories yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
