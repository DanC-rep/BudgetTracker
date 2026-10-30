import { Category } from '@/entities/categories/types'
import { BudgetStatusResponseItem, MonthlySummary } from '@/entities/reports/api'

export type MonthStats = {
   income: number
   expense: number
   net: number
}

export type BudgetStatusItem = {
   category: Category
   spent: number
   limit: number
   percent: number
}

export function toMonthStats(summary: MonthlySummary | null): MonthStats {
   return {
      income: summary?.totalIncome ?? 0,
      expense: summary?.totalExpense ?? 0,
      net: summary?.net ?? 0,
   }
}

/** Join the budget-status report with categories to restore color for display; keeps server ordering */
export function toBudgetStatusItems(
   items: BudgetStatusResponseItem[],
   categories: Category[],
): BudgetStatusItem[] {
   return items.flatMap(item => {
      const category = categories.find(candidate => candidate.id === item.categoryId)
      if (!category) return []

      return [
         {
            category,
            spent: item.spent,
            limit: item.monthlyLimit,
            percent: Math.min(100, Math.round((item.spent / item.monthlyLimit) * 100)),
         },
      ]
   })
}
