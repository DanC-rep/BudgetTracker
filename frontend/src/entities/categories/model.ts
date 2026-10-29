import { Category, CategoryType } from './types'

export const categoryTypeLabel: Record<CategoryType, string> = {
   expense: 'Расход',
   income: 'Доход',
}

/** Soft palette presets for the category color picker */
export const categoryColorPresets = [
   '#5c9a8b',
   '#7fa86b',
   '#c2a35d',
   '#c97e5a',
   '#c2668a',
   '#8a7fc2',
   '#5f8fc9',
   '#68758c',
]

export function isSameMonth(date: Date, reference: Date): boolean {
   return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth()
}

/** Sum of expenses in the given month for one category */
export function getCategorySpent(transactions: { type: string; categoryId?: string; amount: number; date: string }[], categoryId: string, month: Date): number {
   return transactions
      .filter(
         transaction =>
            transaction.type === 'expense' &&
            transaction.categoryId === categoryId &&
            isSameMonth(new Date(transaction.date), month),
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0)
}

/** System categories and categories with operations cannot be deleted (business rule 6) */
export function canDeleteCategory(category: Category, transactions: { categoryId?: string }[]): boolean {
   if (category.isSystem) return false

   return !transactions.some(transaction => transaction.categoryId === category.id)
}
