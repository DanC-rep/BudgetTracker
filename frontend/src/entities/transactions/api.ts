import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-instance'
import { PagedResponse } from '@/shared/api/types'
import { Transaction, TransactionType } from './types'

export type GetTransactionsParams = {
   from?: string
   to?: string
   accountId?: string
   categoryId?: string
   type?: TransactionType
   page: number
   pageSize: number
}

export type CreateTransactionPayload =
   | {
        type: 'income' | 'expense'
        accountId: string
        categoryId: string
        amount: number
        currency: string
        date: string
        description: string | null
     }
   | {
        type: 'transfer'
        fromAccountId: string
        toAccountId: string
        amount: number
        currency: string
        date: string
        description: string | null
     }

export type UpdateTransactionRequest = {
   type: TransactionType
   accountId: string
   toAccountId: string | null
   categoryId: string | null
   amount: number
   currency: string
   date: string
   description: string | null
}

export const transactionsApi = {
   getList: async (params: GetTransactionsParams): Promise<PagedResponse<Transaction>> => {
      const response = await apiClient.get<PagedResponse<Transaction>>('api/transactions', { params })
      return response.data
   },

   create: async (payload: CreateTransactionPayload): Promise<Transaction> => {
      const body =
         payload.type === 'transfer'
            ? {
                 fromAccountId: payload.fromAccountId,
                 toAccountId: payload.toAccountId,
                 amount: payload.amount,
                 currency: payload.currency,
                 date: payload.date,
                 description: payload.description,
              }
            : {
                 accountId: payload.accountId,
                 categoryId: payload.categoryId,
                 amount: payload.amount,
                 currency: payload.currency,
                 date: payload.date,
                 description: payload.description,
              }

      const response = await apiClient.post<Transaction>(`api/transactions/${payload.type}`, body)
      return response.data
   },

   update: async (transactionId: string, request: UpdateTransactionRequest): Promise<Transaction> => {
      const response = await apiClient.patch<Transaction>(`api/transactions/${transactionId}`, request)
      return response.data
   },

   delete: async (transactionId: string): Promise<void> => {
      await apiClient.delete(`api/transactions/${transactionId}`)
   },
}

export const transactionsQueryOptions = {
   baseKey: 'transactions',

   list: (params: GetTransactionsParams) =>
      queryOptions({
         queryFn: () => transactionsApi.getList(params),
         queryKey: [transactionsQueryOptions.baseKey, 'list', params],
      }),
}
