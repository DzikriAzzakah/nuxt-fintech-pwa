export interface CategoryMeta {
  label: string
  emoji: string
  bgHex: string
  colorHex: string
}

export interface CustomCategory extends CategoryMeta {
  id?: string
  key: string
  type: 'income' | 'expense'
  groupId: string
}
