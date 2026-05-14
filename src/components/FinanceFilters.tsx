import React from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { CATEGORIES, INCOME_CATEGORIES, FilterState, IncomeCategoryEntity } from '../types';

interface FinanceFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  type: 'expenses' | 'income';
  incomeCategories?: IncomeCategoryEntity[];
}

export default function FinanceFilters({ filters, onFilterChange, type, incomeCategories = [] }: FinanceFiltersProps) {
  const categories = type === 'expenses' 
    ? CATEGORIES 
    : [...INCOME_CATEGORIES, ...incomeCategories.map(c => c.name)];

  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: 'All',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-6 transition-all hover:shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Search</label>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder={type === 'expenses' ? "Search item..." : "Search source..."}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-600"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Classification</label>
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all text-sm font-semibold text-slate-600 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Start */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">From Date</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-500"
            />
          </div>
        </div>

        {/* Date Range End */}
        <div className="flex flex-col">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">To Date</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-500"
              />
            </div>
            {(filters.search || filters.category !== 'All' || filters.startDate || filters.endDate) && (
              <button 
                onClick={clearFilters}
                className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all"
                title="Clear Filters"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
