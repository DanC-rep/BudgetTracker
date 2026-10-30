import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-instance'
import { Transaction } from '@/entities/transactions/types'
import { CategoryType } from '@/entities/categories/types'

export type TotalBalance = {
   total: number
   accountsCount: number
}

export type MonthlySummary = {
   totalIncome: number
   totalExpense: number
   net: number
   byCategory: {
      categoryId: string
      name: string
      type: CategoryType
      total: number
   }[]
}

export type BudgetStatusResponseItem = {
   categoryId: string
   name: string
   monthlyLimit: number
   limitCurrency: string
   spent: number
   isExceeded: boolean
}

export type DashboardResponse = {
   totalBalance: TotalBalance
   recentTransactions: Transaction[]
   budgetStatus: BudgetStatusResponseItem[]
}

export const reportsApi = {
   getDashboard: async (): Promise<DashboardResponse> => {
      const response = await apiClient.get<DashboardResponse>('api/reports/dashboard')
      return response.data
   },

   getMonthlySummary: async (year: number, month: number): Promise<MonthlySummary> => {
      const response = await apiClient.get<MonthlySummary>('api/reports/monthly-summary', {
         params: { year, month },
      })
      return response.data
   },

   getBudgetStatus: async (year: number, month: number): Promise<BudgetStatusResponseItem[]> => {
      const response = await apiClient.get<{ items: BudgetStatusResponseItem[] }>('api/reports/budget-status', {
         params: { year, month },
      })
      return response.data.items
   },
}

export const reportsQueryOptions = {
   baseKey: 'reports',

   dashboard: () =>
      queryOptions({
         queryFn: () => reportsApi.getDashboard(),
         queryKey: [reportsQueryOptions.baseKey, 'dashboard'],
      }),

   monthlySummary: (year: number, month: number) =>
      queryOptions({
         queryFn: () => reportsApi.getMonthlySummary(year, month),
         queryKey: [reportsQueryOptions.baseKey, 'monthly-summary', year, month],
      }),

   budgetStatus: (year: number, month: number) =>
      queryOptions({
         queryFn: () => reportsApi.getBudgetStatus(year, month),
         queryKey: [reportsQueryOptions.baseKey, 'budget-status', year, month],
      }),
}
