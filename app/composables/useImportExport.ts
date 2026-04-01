import dayjs from 'dayjs'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryMeta } from './useCategory'
import type { Transaction } from '@/types/transaction'

const INDO_MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const INDO_MONTHS: Record<string, number> = {
  januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
  juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
}

const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

const parseImportDate = (dateStr: string): number => {
  const s = dateStr.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return dayjs(s).valueOf()
  const parts = s.split(/\s+/)
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = INDO_MONTHS[parts[1].toLowerCase()]
    const year = parseInt(parts[2])
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day).getTime()
    }
  }
  return dayjs(s).valueOf()
}

const buildCategoryMap = (): Record<string, { key: string; type: 'income' | 'expense' }> => {
  const map: Record<string, { key: string; type: 'income' | 'expense' }> = {
    income: { key: 'salary', type: 'income' }
  }
  for (const [key, meta] of Object.entries(EXPENSE_CATEGORIES)) {
    map[(meta as { label: string }).label.toLowerCase()] = { key, type: 'expense' }
  }
  for (const [key, meta] of Object.entries(INCOME_CATEGORIES)) {
    map[(meta as { label: string }).label.toLowerCase()] = { key, type: 'income' }
  }
  return map
}

export const useImportExport = () => {
  const exportToCSV = (transactions: Transaction[]) => {
    const header = 'Date,Total,Category,Note'
    const rows = transactions.map(t => {
      const d = dayjs(t.createdAt)
      const dateStr = `${d.date()} ${INDO_MONTH_NAMES[d.month()]} ${d.year()}`
      const category = getCategoryMeta(t.category).label
      const note = (t.note ?? '').includes(',') ? `"${t.note}"` : (t.note ?? '')
      return `${dateStr},${t.amount},${category},${note}`
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${dayjs().format('YYYY-MM-DD')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importFromCSV = (
    file: File,
    addTransactionFn: (data: Omit<Transaction, 'id'>) => Promise<void>,
    groupId: string
  ): Promise<{ imported: number; errors: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const errors: string[] = []
        let imported = 0
        try {
          const text = ((e.target?.result as string) ?? '').replace(/\r/g, '')
          const lines = text.split('\n').filter(l => l.trim())
          if (lines.length < 2) {
            resolve({ imported: 0, errors: ['File is empty or has no data rows.'] })
            return
          }
          const [headerLine, ...dataLines] = lines
          const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim())
          const dateIdx = headers.indexOf('date')
          const totalIdx = headers.indexOf('total')
          const categoryIdx = headers.indexOf('category')
          const noteIdx = headers.indexOf('note')

          if (dateIdx === -1 || totalIdx === -1 || categoryIdx === -1) {
            resolve({ imported: 0, errors: ['Missing required columns: Date, Total, Category'] })
            return
          }

          const catMap = buildCategoryMap()

          for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i].trim()
            if (!line) continue
            try {
              const cols = parseCSVLine(line)
              const dateStr = cols[dateIdx] ?? ''
              const totalStr = cols[totalIdx] ?? '0'
              const categoryStr = cols[categoryIdx] ?? ''
              const noteStr = noteIdx !== -1 ? (cols[noteIdx] ?? '') : ''

              const createdAt = parseImportDate(dateStr)
              const amount = Math.abs(Number(totalStr.replace(/[^0-9.-]/g, '')))
              const catLookup = catMap[categoryStr.toLowerCase()]

              if (!catLookup) {
                errors.push(`Row ${i + 2}: Unknown category "${categoryStr}", skipped.`)
                continue
              }

              await addTransactionFn({
                groupId,
                amount,
                type: catLookup.type,
                category: catLookup.key as any,
                note: noteStr,
                createdAt
              })
              imported++
            } catch (rowErr: any) {
              errors.push(`Row ${i + 2}: ${rowErr?.message ?? 'Unknown error'}`)
            }
          }
          resolve({ imported, errors })
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  return { exportToCSV, importFromCSV }
}
