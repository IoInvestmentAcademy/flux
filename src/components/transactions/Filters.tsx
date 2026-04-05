import React from 'react'
import { X, Search, Filter } from 'lucide-react'
import { Input, Button } from '../ui'
import { cn } from '../../lib/utils'
import { usePreferences } from '../../lib/PreferencesContext'
import type { Category, FilterState } from '../../types'

interface FiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  categories: Category[]
}

export const Filters: React.FC<FiltersProps> = ({ filters, onChange, categories }) => {
  const { t } = usePreferences()

  const hasActiveFilters =
    filters.dateFrom || filters.dateTo || filters.type || filters.categoryIds.length > 0 || filters.detailSearch

  const clearAll = () =>
    onChange({ dateFrom: '', dateTo: '', type: '', categoryIds: [], detailSearch: '' })

  const toggleCategory = (id: string) => {
    const exists = filters.categoryIds.includes(id)
    onChange({
      ...filters,
      categoryIds: exists ? filters.categoryIds.filter((c) => c !== id) : [...filters.categoryIds, id],
    })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Filter className="w-4 h-4" />
          {t.filters}
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} leftIcon={<X className="w-3 h-3" />}>
            {t.clearFilters}
          </Button>
        )}
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t.dateFrom}
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
        />
        <Input
          label={t.dateTo}
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
        />
      </div>

      {/* Type */}
      <div className="flex gap-2">
        {(['', 'expense', 'income'] as const).map((type) => (
          <button
            key={type}
            onClick={() => onChange({ ...filters, type })}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filters.type === type
                ? type === 'expense'
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : type === 'income'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {type === '' ? t.all : type === 'expense' ? t.appliesToExpense : t.appliesToIncome}
          </button>
        ))}
      </div>

      {/* Category multi-select */}
      {categories.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t.categories}</p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const isSelected = filters.categoryIds.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
                    isSelected
                      ? 'border-transparent text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  style={isSelected ? { backgroundColor: cat.color } : undefined}
                >
                  {!isSelected && (
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  )}
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Detail search */}
      <Input
        label={t.detail}
        type="text"
        placeholder={t.detailPlaceholder}
        value={filters.detailSearch}
        onChange={(e) => onChange({ ...filters, detailSearch: e.target.value })}
        leftElement={<Search className="w-4 h-4" />}
      />
    </div>
  )
}

export default Filters
