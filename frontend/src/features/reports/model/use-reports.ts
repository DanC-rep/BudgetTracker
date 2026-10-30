'use client'

import { useQuery } from '@tanstack/react-query'
import { isApiRequestError } from '@/shared/api/errors'
import {
   BudgetStatusResponseItem,
   MonthlySummary,
   reportsQueryOptions,
} from '@/entities/reports/api'

export function useDashboard() {
   const query = useQuery(reportsQueryOptions.dashboard())

   return {
      data: query.data ?? null,
      isPending: query.isPending,
      isError: query.isError,
      error: isApiRequestError(query.error) ? query.error : null,
      refetch: query.refetch,
   }
}

export function useMonthlySummary(year: number, month: number): MonthlySummary | null {
   const query = useQuery(reportsQueryOptions.monthlySummary(year, month))
   return query.data ?? null
}

export function useBudgetStatus(year: number, month: number): BudgetStatusResponseItem[] {
   const query = useQuery(reportsQueryOptions.budgetStatus(year, month))
   return query.data ?? []
}
