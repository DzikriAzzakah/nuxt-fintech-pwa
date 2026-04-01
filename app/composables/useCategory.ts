export const EXPENSE_CATEGORIES = {
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
} as const

export const INCOME_CATEGORIES = {
  salary:     { label: 'Salary',        emoji: '💵', bgHex: '#DCFCE7', colorHex: '#16A34A' },
  freelance:  { label: 'Freelance',     emoji: '💻', bgHex: '#E0F2FE', colorHex: '#0EA5E9' },
  bonus:      { label: 'Bonus',         emoji: '🎉', bgHex: '#D1FAE5', colorHex: '#10B981' },
  investment: { label: 'Investment',    emoji: '📈', bgHex: '#E0E7FF', colorHex: '#4F46E5' },
  cashback:   { label: 'Cashback',      emoji: '🔄', bgHex: '#EDE9FE', colorHex: '#8B5CF6' },
  transfer:   { label: 'Transfer In',   emoji: '💳', bgHex: '#FCE7F3', colorHex: '#DB2777' },
  otherIn:    { label: 'Other Income',  emoji: '💎', bgHex: '#CCFBF1', colorHex: '#14B8A6' },
} as const

export const CATEGORIES = { ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES } as const

export type CategoryKey = keyof typeof CATEGORIES

export const getCategoryMeta = (category: string) => {
  return (CATEGORIES as Record<string, { label: string; emoji: string; bgHex: string; colorHex: string }>)[category]
    ?? { label: category, emoji: '📦', bgHex: '#F9FAFB', colorHex: '#9CA3AF' }
}
