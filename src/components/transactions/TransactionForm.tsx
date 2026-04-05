import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Button, Input, Select } from '../ui'
import { cn, todayISO } from '../../lib/utils'
import { usePreferences } from '../../lib/PreferencesContext'
import type { Category, CustomFieldDefinition, Transaction } from '../../types'

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
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  customFields,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { t } = usePreferences()
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
        render={({ field }) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.category}</label>
            <div className="relative">
              {/* Color dot preview */}
              {field.value && (
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10 pointer-events-none"
                  style={{
                    backgroundColor: filteredCategories.find((c) => c.id === field.value)?.color ?? 'transparent',
                  }}
                />
              )}
              <select
                {...field}
                className={cn(
                  'w-full appearance-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                  'px-3 py-2 pr-9 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  field.value ? 'pl-8' : 'pl-3'
                )}
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
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
