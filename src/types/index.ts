export type TransactionType = 'expense' | 'income'

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  type: 'expense' | 'income' | 'both'
  is_default: boolean
  created_at: string
}

export type CustomFieldType = 'text' | 'number' | 'boolean' | 'select'
export type CustomFieldAppliesTo = 'expense' | 'income' | 'both'

export interface CustomFieldDefinition {
  id: string
  user_id: string
  name: string
  field_type: CustomFieldType
  options?: string[]
  applies_to: CustomFieldAppliesTo
  is_required: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  date: string
  category_id: string | null
  category?: Category
  detail: string | null
  note: string | null
  custom_fields: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type AssetType = 'cash' | 'investment' | 'real_estate' | 'vehicle' | 'other'
export type LiabilityType = 'mortgage' | 'car_loan' | 'personal_loan' | 'credit_card' | 'other'

export interface FinancialIncome {
  id: string
  user_id: string
  name: string
  amount: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface FinancialFixedExpense {
  id: string
  user_id: string
  name: string
  amount: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface FinancialAsset {
  id: string
  user_id: string
  name: string
  asset_type: AssetType
  value: number
  monthly_income: number
  sort_order: number
  created_at: string
}

export interface FinancialLiability {
  id: string
  user_id: string
  name: string
  liability_type: LiabilityType
  balance: number
  monthly_payment: number
  sort_order: number
  created_at: string
}

export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  netWorth: number
  monthlyIncomeChange: number
  monthlyExpenseChange: number
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  savings: number
}

export interface CategorySpending {
  category_id: string
  category_name: string
  category_color: string
  total: number
  percentage: number
}

export interface FilterState {
  dateFrom: string
  dateTo: string
  type: TransactionType | ''
  categoryIds: string[]
  detailSearch: string
}

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}
