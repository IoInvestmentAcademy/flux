import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, Sun, Moon, Monitor } from 'lucide-react'
import { Card, CardHeader, CardTitle, Button, Input, Badge, Modal, Select } from '../components/ui'
import { useCategories } from '../hooks/useCategories'
import { useCustomFields } from '../hooks/useCustomFields'
import { useToast } from '../components/ui/ToastProvider'
import { categoryTypeLabel } from '../lib/categories'
import type { Category, CustomFieldDefinition, CustomFieldType, CustomFieldAppliesTo } from '../types'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'
import { usePreferences } from '../lib/PreferencesContext'
import type { Language, Currency } from '../lib/i18n'

interface SettingsProps {
  userId: string
}

type ThemeMode = 'light' | 'dark' | 'system'


const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4',
  '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#78716c', '#94a3b8',
]

const THEME_KEY = 'flux-theme'

function getStoredTheme(): ThemeMode {
  try { return (localStorage.getItem(THEME_KEY) as ThemeMode) ?? 'system' } catch { return 'system' }
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  try { localStorage.setItem(THEME_KEY, theme) } catch {}
}

export const Settings: React.FC<SettingsProps> = ({ userId }) => {
  const { user } = useAuth()
  const { t, language, currency, setLanguage, setCurrency } = usePreferences()
  const { showSuccess, showError } = useToast()
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories(userId)
  const { fields, addField, updateField, deleteField } = useCustomFields(userId)
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme)

  const FIELD_TYPE_OPTIONS = [
    { value: 'text', label: t.textField },
    { value: 'number', label: t.numberField },
    { value: 'boolean', label: t.booleanField },
    { value: 'select', label: t.selectField },
  ]

  const APPLIES_TO_OPTIONS = [
    { value: 'expense', label: t.appliesToExpense },
    { value: 'income', label: t.appliesToIncome },
    { value: 'both', label: t.appliesToBoth },
  ]

  // Category form state
  const [showCatModal, setShowCatModal] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [catName, setCatName] = useState('')
  const [catColor, setCatColor] = useState('#6366f1')
  const [catType, setCatType] = useState<Category['type']>('expense')
  const [catLoading, setCatLoading] = useState(false)

  // Custom field form state
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null)
  const [fieldName, setFieldName] = useState('')
  const [fieldType, setFieldType] = useState<CustomFieldType>('text')
  const [fieldAppliesTo, setFieldAppliesTo] = useState<CustomFieldAppliesTo>('expense')
  const [fieldRequired, setFieldRequired] = useState(false)
  const [fieldOptions, setFieldOptions] = useState('')
  const [fieldLoading, setFieldLoading] = useState(false)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Category CRUD
  const openAddCat = () => {
    setEditingCat(null); setCatName(''); setCatColor('#6366f1'); setCatType('expense')
    setShowCatModal(true)
  }
  const openEditCat = (cat: Category) => {
    setEditingCat(cat); setCatName(cat.name); setCatColor(cat.color); setCatType(cat.type)
    setShowCatModal(true)
  }
  const handleSaveCat = async () => {
    if (!catName.trim()) return
    setCatLoading(true)
    if (editingCat) {
      const { error } = await updateCategory(editingCat.id, { name: catName, color: catColor, type: catType })
      if (error) showError(error)
      else { showSuccess(t.categoryUpdated); setShowCatModal(false) }
    } else {
      const { error } = await addCategory({ name: catName, icon: 'tag', color: catColor, type: catType, is_default: false })
      if (error) showError(error)
      else { showSuccess(t.categoryAdded); setShowCatModal(false) }
    }
    setCatLoading(false)
  }
  const handleDeleteCat = async (id: string) => {
    if (!confirm(t.deleteCategoryConfirm)) return
    const { error } = await deleteCategory(id)
    if (error) showError(error)
    else showSuccess(t.categoryDeleted)
  }

  // Custom field CRUD
  const openAddField = () => {
    setEditingField(null); setFieldName(''); setFieldType('text'); setFieldAppliesTo('expense')
    setFieldRequired(false); setFieldOptions('')
    setShowFieldModal(true)
  }
  const openEditField = (field: CustomFieldDefinition) => {
    setEditingField(field); setFieldName(field.name); setFieldType(field.field_type)
    setFieldAppliesTo(field.applies_to); setFieldRequired(field.is_required)
    setFieldOptions(field.options?.join(', ') ?? '')
    setShowFieldModal(true)
  }
  const handleSaveField = async () => {
    if (!fieldName.trim()) return
    setFieldLoading(true)
    const options = fieldType === 'select' ? fieldOptions.split(',').map((s) => s.trim()).filter(Boolean) : undefined
    const data = { name: fieldName, field_type: fieldType, applies_to: fieldAppliesTo, is_required: fieldRequired, options }
    if (editingField) {
      const { error } = await updateField(editingField.id, data)
      if (error) showError(error)
      else { showSuccess(t.fieldUpdated); setShowFieldModal(false) }
    } else {
      const { error } = await addField(data)
      if (error) showError(error)
      else { showSuccess(t.fieldAdded); setShowFieldModal(false) }
    }
    setFieldLoading(false)
  }
  const handleDeleteField = async (id: string) => {
    if (!confirm(t.deleteFieldConfirm)) return
    const { error } = await deleteField(id)
    if (error) showError(error)
    else showSuccess(t.fieldDeleted)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.settings}</h1>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>{t.profile}</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{t.activeAccount}</p>
          </div>
        </div>
      </Card>

      {/* Preferences: Language + Currency */}
      <Card>
        <CardHeader>
          <CardTitle>{t.preferences}</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {/* Language */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.language}</p>
            <div className="flex gap-2">
              {(['ro', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all',
                    language === lang
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  {lang === 'ro' ? 'Română' : 'English'}
                </button>
              ))}
            </div>
          </div>
          {/* Currency */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.currency}</p>
            <div className="flex gap-2">
              {(['RON', 'USD', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all',
                    currency === cur
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  {cur === 'RON' ? 'RON (lei)' : cur === 'USD' ? 'USD ($)' : 'EUR (€)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle>{t.theme}</CardTitle>
        </CardHeader>
        <div className="flex gap-3">
          {([
            { value: 'light', label: t.light, icon: <Sun className="w-4 h-4" /> },
            { value: 'dark', label: t.dark, icon: <Moon className="w-4 h-4" /> },
            { value: 'system', label: t.system, icon: <Monitor className="w-4 h-4" /> },
          ] as { value: ThemeMode; label: string; icon: React.ReactNode }[]).map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                'flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl border text-sm font-medium transition-all',
                theme === themeOption.value
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              {themeOption.icon}
              {themeOption.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>{t.categories} ({categories.length})</CardTitle>
          <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openAddCat}>
            {t.addCategory}
          </Button>
        </CardHeader>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">{cat.name}</span>
              <Badge variant={cat.type === 'expense' ? 'danger' : cat.type === 'income' ? 'success' : 'info'}>
                {categoryTypeLabel(cat.type)}
              </Badge>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditCat(cat)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteCat(cat.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Custom Fields */}
      <Card>
        <CardHeader>
          <CardTitle>{t.customFieldsSection} ({fields.length})</CardTitle>
          <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openAddField}>
            {t.addField}
          </Button>
        </CardHeader>
        {fields.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            {t.noCustomFields}
          </p>
        ) : (
          <div className="space-y-1">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{field.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {FIELD_TYPE_OPTIONS.find((o) => o.value === field.field_type)?.label} ·{' '}
                    {APPLIES_TO_OPTIONS.find((o) => o.value === field.applies_to)?.label}
                    {field.is_required && ` · ${t.requiredField}`}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditField(field)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Category Modal */}
      <Modal
        isOpen={showCatModal}
        onClose={() => setShowCatModal(false)}
        title={editingCat ? t.editCategory : t.newCategory}
      >
        <div className="space-y-4">
          <Input
            label={t.categoryName}
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder={t.categoryNamePlaceholder}
            autoFocus
          />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t.categoryColor}</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCatColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-xl transition-transform',
                    catColor === color && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <Select
            label={t.categoryType}
            value={catType}
            onChange={(e) => setCatType(e.target.value as Category['type'])}
            options={APPLIES_TO_OPTIONS}
          />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCatModal(false)}>
              {t.cancel}
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSaveCat} loading={catLoading}>
              {t.save}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Custom Field Modal */}
      <Modal
        isOpen={showFieldModal}
        onClose={() => setShowFieldModal(false)}
        title={editingField ? t.editField : t.newField}
      >
        <div className="space-y-4">
          <Input
            label={t.fieldName}
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            placeholder={t.fieldNamePlaceholder}
            autoFocus
          />
          <Select
            label={t.fieldType}
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value as CustomFieldType)}
            options={FIELD_TYPE_OPTIONS}
          />
          <Select
            label={t.fieldAppliesTo}
            value={fieldAppliesTo}
            onChange={(e) => setFieldAppliesTo(e.target.value as CustomFieldAppliesTo)}
            options={APPLIES_TO_OPTIONS}
          />
          {fieldType === 'select' && (
            <Input
              label={t.fieldOptions}
              value={fieldOptions}
              onChange={(e) => setFieldOptions(e.target.value)}
              placeholder={t.fieldOptionsPlaceholder}
            />
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fieldRequired}
              onChange={(e) => setFieldRequired(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t.requiredField}</span>
          </label>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowFieldModal(false)}>
              {t.cancel}
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSaveField} loading={fieldLoading}>
              {t.save}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Settings
