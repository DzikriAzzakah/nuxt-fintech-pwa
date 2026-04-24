import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/services/firebase"
import type { CategoryMeta, CustomCategory } from "@/types/category"

export const EXPENSE_CATEGORIES: Record<string, CategoryMeta> = {
  food:       { label: 'Food',          emoji: '🍜', bgHex: '#FFF7ED', colorHex: '#F97316' },
  snacking:   { label: 'Snacking',      emoji: '🍿', bgHex: '#FEFCE8', colorHex: '#EAB308' },
  laundry:    { label: 'Laundry',       emoji: '👕', bgHex: '#EFF6FF', colorHex: '#3B82F6' },
  fuel:       { label: 'Fuel/Gasoline', emoji: '⛽', bgHex: '#F3F4F6', colorHex: '#6B7280' },
  vehicle:    { label: 'Vehicle',       emoji: '🚗', bgHex: '#F8FAFC', colorHex: '#475569' },
  bodycare:   { label: 'BodyCare',      emoji: '🛁', bgHex: '#FDF2F8', colorHex: '#EC4899' },
  skincare:   { label: 'SkinCare',      emoji: '✨', bgHex: '#FAF5FF', colorHex: '#A855F7' },
  clothes:    { label: 'Clothes',       emoji: '👗', bgHex: '#EEF2FF', colorHex: '#6366F1' },
  rent:       { label: 'Rent',          emoji: '🏠', bgHex: '#F0FDFA', colorHex: '#14B8A6' },
  family:     { label: 'Family',        emoji: '👪', bgHex: '#F0FDF4', colorHex: '#22C55E' },
  unexpected: { label: 'Unexpected',    emoji: '⚡', bgHex: '#FEF2F2', colorHex: '#EF4444' },
}

export const INCOME_CATEGORIES: Record<string, CategoryMeta> = {
  salary:     { label: 'Salary',        emoji: '💵', bgHex: '#DCFCE7', colorHex: '#16A34A' },
  freelance:  { label: 'Freelance',     emoji: '💻', bgHex: '#E0F2FE', colorHex: '#0EA5E9' },
  bonus:      { label: 'Bonus',         emoji: '🎉', bgHex: '#D1FAE5', colorHex: '#10B981' },
  investment: { label: 'Investment',    emoji: '📈', bgHex: '#E0E7FF', colorHex: '#4F46E5' },
  cashback:   { label: 'Cashback',      emoji: '🔄', bgHex: '#EDE9FE', colorHex: '#8B5CF6' },
  transfer:   { label: 'Transfer In',   emoji: '💳', bgHex: '#FCE7F3', colorHex: '#DB2777' },
  otherIn:    { label: 'Other Income',  emoji: '💎', bgHex: '#CCFBF1', colorHex: '#14B8A6' },
}

export const CATEGORIES: Record<string, CategoryMeta> = { ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES }

// Module-level reactive store so all component instances share the same data
const _customCategories = ref<CustomCategory[]>([])

export const getCategoryMeta = (category: string): CategoryMeta => {
  return CATEGORIES[category]
    ?? _customCategories.value.find(c => c.key === category)
    ?? { label: category, emoji: '📦', bgHex: '#F9FAFB', colorHex: '#9CA3AF' }
}

export const useCategory = () => {
  const isLoading = ref(false)
  const isAdding = ref(false)
  const isDeleting = ref(false)

  const fetchCustomCategories = (groupId: string) => {
    isLoading.value = true
    const q = query(collection(db, 'categories'), where('groupId', '==', groupId))
    onSnapshot(
      q,
      (snapshot) => {
        _customCategories.value = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as CustomCategory[]
        isLoading.value = false
      },
      (err) => {
        console.error('[useCategory] onSnapshot error:', err)
        isLoading.value = false
      }
    )
  }

  const addCategory = async (data: Omit<CustomCategory, 'id'>) => {
    isAdding.value = true
    try {
      await addDoc(collection(db, 'categories'), data)
    } finally {
      isAdding.value = false
    }
  }

  const deleteCategory = async (id: string) => {
    isDeleting.value = true
    try {
      await deleteDoc(doc(db, 'categories', id))
    } finally {
      isDeleting.value = false
    }
  }

  const expenseCategories = computed(() => {
    const custom = _customCategories.value
      .filter(c => c.type === 'expense')
      .reduce((acc, c) => ({ ...acc, [c.key]: { label: c.label, emoji: c.emoji, bgHex: c.bgHex, colorHex: c.colorHex } }), {} as Record<string, CategoryMeta>)
    return { ...EXPENSE_CATEGORIES, ...custom }
  })

  const incomeCategories = computed(() => {
    const custom = _customCategories.value
      .filter(c => c.type === 'income')
      .reduce((acc, c) => ({ ...acc, [c.key]: { label: c.label, emoji: c.emoji, bgHex: c.bgHex, colorHex: c.colorHex } }), {} as Record<string, CategoryMeta>)
    return { ...INCOME_CATEGORIES, ...custom }
  })

  const customExpenseCategories = computed(() => _customCategories.value.filter(c => c.type === 'expense'))
  const customIncomeCategories = computed(() => _customCategories.value.filter(c => c.type === 'income'))

  return {
    isLoading,
    isAdding,
    isDeleting,
    fetchCustomCategories,
    addCategory,
    deleteCategory,
    expenseCategories,
    incomeCategories,
    customExpenseCategories,
    customIncomeCategories,
  }
}
