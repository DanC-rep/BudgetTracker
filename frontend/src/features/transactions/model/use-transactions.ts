'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isApiRequestError } from '@/shared/api/errors'
import { getTotalPages } from '@/shared/api/types'
import { accountsQueryOptions } from '@/entities/accounts/api'
import { categoriesQueryOptions } from '@/entities/categories/api'
import { GetTransactionsParams, transactionsApi, transactionsQueryOptions, CreateTransactionPayload, UpdateTransactionRequest } from '@/entities/transactions/api'
import { toTransactionView } from '@/entities/transactions/view'
import { TransactionsFilterState } from './transactions-filter-store'

export function useTransactionsList(
   filter: Pick<TransactionsFilterState, 'type' | 'accountId' | 'categoryId' | 'from' | 'to' | 'page'>,
   pageSize: number,
) {
   const accountsQuery = useQuery(accountsQueryOptions.all(true))
   const categoriesQuery = useQuery(categoriesQueryOptions.all(true))

   const params: GetTransactionsParams = {
      page: filter.page,
      pageSize,
      // The API treats from/to as inclusive bounds; expand dates to full days
      ...(filter.from ? { from: `${filter.from}T00:00:00` } : {}),
      ...(filter.to ? { to: `${filter.to}T23:59:59` } : {}),
      ...(filter.type !== 'all' ? { type: filter.type } : {}),
      ...(filter.accountId !== 'all' ? { accountId: filter.accountId } : {}),
      ...(filter.categoryId !== 'all' ? { categoryId: filter.categoryId } : {}),
   }

   const listQuery = useQuery(transactionsQueryOptions.list(params))

   const accounts = accountsQuery.data ?? []
   const categories = categoriesQuery.data ?? []
   const data = listQuery.data

   const error = [listQuery.error, accountsQuery.error, categoriesQuery.error].find(isApiRequestError) ?? null

   return {
      items: (data?.items ?? []).map(transaction => toTransactionView(transaction, accounts, categories)),
      page: data?.page ?? filter.page,
      totalCount: data?.totalCount ?? 0,
      totalPages: data ? getTotalPages(data.totalCount, data.pageSize) : 1,
      isPending: listQuery.isPending || accountsQuery.isPending || categoriesQuery.isPending,
      isError: listQuery.isError || accountsQuery.isError || categoriesQuery.isError,
      error,
      refetch: listQuery.refetch,
   }
}

export function useDeleteTransaction() {
   const queryClient = useQueryClient()

   const mutation = useMutation({
      mutationFn: (transactionId: string) => transactionsApi.delete(transactionId),
      onSuccess: () => toast.success('Операция удалена'),
      onError: error => {
         if (isApiRequestError(error)) {
            toast.error(error.firstMessage)
            return
         }

         toast.error('Произошла неизвестная ошибка. Попробуйте перезагрузить страницу.')
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: [transactionsQueryOptions.baseKey] })
         queryClient.invalidateQueries({ queryKey: ['accounts'] })
         queryClient.invalidateQueries({ queryKey: ['reports'] })
      },
   })

   return {
      deleteTransaction: mutation.mutate,
      isPending: mutation.isPending,
      deletingId: mutation.isPending ? (mutation.variables ?? null) : null,
   }
}

// Create/update intentionally have no onError toast: the form dialog maps
// server validation errors onto fields and toasts the rest via mutate options.
function useInvalidateTransactionData() {
   const queryClient = useQueryClient()

   return () => {
      queryClient.invalidateQueries({ queryKey: [transactionsQueryOptions.baseKey] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
   }
}

export function useCreateTransaction() {
   const invalidate = useInvalidateTransactionData()

   const mutation = useMutation({
      mutationFn: (payload: CreateTransactionPayload) => transactionsApi.create(payload),
      onSuccess: created =>
         toast.success(created.description ? `Операция «${created.description}» добавлена` : 'Операция добавлена'),
      onSettled: invalidate,
   })

   return { createTransaction: mutation.mutate, isPending: mutation.isPending }
}

export function useUpdateTransaction() {
   const invalidate = useInvalidateTransactionData()

   const mutation = useMutation({
      mutationFn: (variables: { transactionId: string; request: UpdateTransactionRequest }) =>
         transactionsApi.update(variables.transactionId, variables.request),
      onSuccess: () => toast.success('Операция обновлена'),
      onSettled: invalidate,
   })

   return { updateTransaction: mutation.mutate, isPending: mutation.isPending }
}
