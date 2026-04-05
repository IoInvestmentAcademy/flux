import React, { useEffect, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingDown, TrendingUp, Plus, Check, ChevronDown } from 'lucide-react'
import { Button, Input, Select } from '../ui'
import { cn, todayISO } from '../../lib/utils'
import { usePreferences } from '../../lib/PreferencesContext'
import type { Category, CustomFieldDefinition, Transaction } from '../../types'

const QUICK_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#06b6d4',
  '#6366f1','#8b5cf6','#ec4899','#78716c','#94a3b8',
]

const schema = z.object({
  type: z.union([z.literal('expense'), z.literal('income')]),
  amount: z.string().min(1, 'Suma este obligatorie').refine(
    (v) => !isNaN(parseFloat(v.replace(',', '.'))) && parseFloat(v.replace(',', '.')) > 0,
    'Suma trebuie să fie un număr pozitiv'
  ),
  date: z.string().min(1, 'Data este obligatorie'),
  category_id: z.string().optional(),
  detail: z.string().optional(),
  note: z.string().optional(),
  custom_fields: z.record(z.string(), z.unknown()).optional(),
})

type FormData = z.infer<typeof schema>

interface TransactionFormProps {
  categories: Category[]
  customFields: CustomFieldDefinition[]
  initialData?: Partial<Transaction>
  onSubmit: (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
  loading?: boolean
  onAddCategory?: (data: { name: string; color: string; type: Category['type']; icon: string; is_default: boolean }) => Promise<{ error: string | null; id?: string }>
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  customFields,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  onAddCategory,
}) => {
  const { t, language } = usePreferences()
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#6366f1')
  const [newCatLoading, setNewCatLoading] = useState(false)
  const newCatInputRef = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initialData?.type ?? 'expense',
      amount: initialData?.amount ? String(initialData.amount) : '',
      date: initialData?.date ?? todayISO(),
      category_id: initialData?.category_id ?? '',
      detail: initialData?.detail ?? '',
      note: initialData?.note ?? '',
      custom_fields: (initialData?.custom_fields as Record<string, unknown>) ?? {},
    },
  })

  const transactionType = watch('type')

  const filteredCategories = categories.filter(
    (c) => c.type === transactionType || c.type === 'both'
  )

  const applicableCustomFields = customFields.filter(
    (f) => f.applies_to === transactionType || f.applies_to === 'both'
  )

  const categoryOptions = [
    { value: '', label: `— ${t.noCategory} —` },
    ...filteredCategories.map((c) => ({ value: c.id, label: c.name })),
  ]

  // Reset category when type changes
  useEffect(() => {
    setValue('category_id', '')
  }, [transactionType, setValue])

  const handleCreateCategory = async (setFieldValue: (id: string) => void) => {
    if (!newCatName.trim() || !onAddCategory) return
    setNewCatLoading(true)
    const result = await onAddCategory({
      name: newCatName.trim(),
      color: newCatColor,
      type: transactionType,
      icon: 'tag',
      is_default: false,
    })
    setNewCatLoading(false)
    if (!result.error && result.id) {
      setFieldValue(result.id)
      setNewCatName('')
      setNewCatColor('#6366f1')
      setShowNewCat(false)
    }
  }

  const handleFormSubmit = handleSubmit(async (data) => {
    const amount = parseFloat(data.amount.replace(',', '.'))
    await onSubmit({
      type: data.type,
      amount,
      date: data.date,
      category_id: data.category_id || null,
      detail: data.detail || null,
      note: data.note || null,
      custom_fields: (data.custom_fields as Record<string, unknown>) ?? {},
    })
  })

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setValue('type', 'expense')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors',
            transactionType === 'expense'
              ? 'bg-red-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
          )}
        >
          <TrendingDown className="w-4 h-4" />
          {t.expense}
        </button>
        <button
          type="button"
          onClick={() => setValue('type', 'income')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors',
            transactionType === 'income'
              ? 'bg-green-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
          )}
        >
          <TrendingUp className="w-4 h-4" />
          {t.incomeLabel}
        </button>
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.amount}</label>
        <div className="relative">
          <input
            {...register('amount')}
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            className={cn(
              'w-full rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 transition-colors',
              'pr-16 py-4 pl-4 text-3xl font-bold text-center',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              errors.amount ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
            )}
            autoFocus
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">lei</span>
        </div>
        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      {/* Date */}
      <Input
        label={t.date}
        type="date"
        {...register('date')}
        error={errors.date?.message}
      />

      {/* Category */}
      <Controller
        control={control}
        name="category_id"
        render={({ field }) => {
          const selectedCat = filteredCategories.find((c) => c.id === field.value)
          return (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.category}</label>

              {/* Category selector */}
              <div className="relative">
                {selectedCat && (
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10 pointer-events-none"
                    style={{ backgroundColor: selectedCat.color }}
                  />
                )}
                <select
                  value={field.value}
                  onChange={field.onChange}
                  className={cn(
                    'w-full appearance-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                    'px-3 py-2 pr-9 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    selectedCat ? 'pl-8' : 'pl-3'
                  )}
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Quick-create new category */}
              {onAddCategory && !showNewCat && (
                <button
                  type="button"
                  onClick={() => { setShowNewCat(true); setTimeout(() => newCatInputRef.current?.focus(), 50) }}
                  className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 font-medium mt-1 w-fit"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Create new category' : 'Categorie nouă'}
                </button>
              )}

              {onAddCategory && showNewCat && (
                <div className="mt-2 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 space-y-2">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {language === 'en' ? 'New category' : 'Categorie nouă'}
                  </p>
                  {/* Name input */}
                  <input
                    ref={newCatInputRef}
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory(field.onChange))}
                    placeholder={language === 'en' ? 'Category name...' : 'Nume categorie...'}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {/* Color picker */}
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCatColor(color)}
                        className={cn(
                          'w-6 h-6 rounded-lg transition-transform',
                          newCatColor === color && 'ring-2 ring-offset-1 ring-gray-400 scale-110'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {/* Preview + actions */}
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: newCatColor }} />
                    <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                      {newCatName || (language === 'en' ? 'Preview...' : 'Previzualizare...')}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setShowNewCat(false); setNewCatName(''); setNewCatColor('#6366f1') }}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="button"
                      disabled={!newCatName.trim() || newCatLoading}
                      onClick={() => handleCreateCategory(field.onChange)}
                      className="flex items-center gap-1 text-xs bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      {newCatLoading ? '...' : <><Check className="w-3 h-3" />{t.save}</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        }}
      />

      {/* Detail */}
      <Input
        label={t.detail}
        type="text"
        placeholder={t.detailPlaceholder}
        {...register('detail')}
        error={errors.detail?.message}
      />

      {/* Note */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.noteOptional}</label>
        <textarea
          {...register('note')}
          rows={2}
          placeholder={t.notePlaceholder}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Custom fields */}
      {applicableCustomFields.map((field) => (
        <Controller
          key={field.id}
          control={control}
          name={`custom_fields.${field.id}` as never}
          render={({ field: formField }) => {
            if (field.field_type === 'boolean') {
              return (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formField.value)}
                    onChange={(e) => formField.onChange(e.target.checked)}
                    className="w-4 h-4 text-indigo-500 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {field.name}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </label>
              )
            }
            if (field.field_type === 'select' && field.options?.length) {
              return (
                <Select
                  label={field.name + (field.is_required ? ' *' : '')}
                  value={String(formField.value ?? '')}
                  onChange={formField.onChange}
                  options={[
                    { value: '', label: '— Selectează —' },
                    ...field.options.map((o) => ({ value: o, label: o })),
                  ]}
                />
              )
            }
            return (
              <Input
                label={field.name + (field.is_required ? ' *' : '')}
                type={field.field_type === 'number' ? 'number' : 'text'}
                value={String(formField.value ?? '')}
                onChange={(e) => formField.onChange(
                  field.field_type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                )}
              />
            )
          }}
        />
      ))}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          {t.cancel}
        </Button>
        <Button type="submit" variant="primary" className="flex-1" loading={loading}>
          {t.save}
        </Button>
      </div>
    </form>
  )
}

export default TransactionForm
