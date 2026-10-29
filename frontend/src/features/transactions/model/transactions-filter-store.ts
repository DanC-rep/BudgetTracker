import { create } from 'zustand'
import { TransactionType } from '@/entities/transactions/types'

export type TransactionTypeFilter = 'all' | TransactionType

export type TransactionsFilterState = {
   search: string
   type: TransactionTypeFilter
   accountId: string
   categoryId: string
   page: number
}

type Actions = {
   setSearch: (search: string) => void
   setType: (type: TransactionTypeFilter) => void
   setAccountId: (accountId: string) => void
   setCategoryId: (categoryId: string) => void
   setPage: (page: number) => void
   resetFilters: () => void
}

type TransactionsFilterStore = TransactionsFilterState & Actions

export const PAGE_SIZE = 8

const initialState: TransactionsFilterState = {
   search: '',
   type: 'all',
   accountId: 'all',
   categoryId: 'all',
   page: 1,
}

export const useTransactionsFilterStore = create<TransactionsFilterStore>(set => ({
   ...initialState,

   setSearch: search => set({ search, page: 1 }),
   setType: type => set({ type, categoryId: 'all', page: 1 }),
   setAccountId: accountId => set({ accountId, page: 1 }),
   setCategoryId: categoryId => set({ categoryId, page: 1 }),
   setPage: page => set({ page }),
   resetFilters: () => set({ ...initialState }),
}))
