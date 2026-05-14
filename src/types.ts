export interface Expense {
  id: string;
  userId: string;
  item: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO string
  createdAt: string; // ISO string
}

export type ExpenseCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Bills' 
  | 'Entertainment' 
  | 'Health' 
  | 'Others';

export const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Others'
];

export interface Income {
  id: string;
  userId: string;
  source: string;
  amount: number;
  category: string;
  date: string; // ISO string
  createdAt: string; // ISO string
}

export interface IncomeCategoryEntity {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export type IncomeCategory = 
  | 'Salary' 
  | 'Freelance' 
  | 'Investments' 
  | 'Business' 
  | 'Gifts' 
  | 'Others';

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Investments',
  'Business',
  'Gifts',
  'Others'
];

export interface MonthlySummary {
  category: string;
  total: number;
}

export interface FilterState {
  search: string;
  category: string;
  startDate: string;
  endDate: string;
}
