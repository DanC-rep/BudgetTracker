import { create } from 'zustand'
import { TransactionType } from '@/entities/transactions/types'

export type TransactionTypeFilter = 'all' | TransactionType

export type TransactionsFilterState = {
   type: TransactionTypeFilter
   accountId: string
   categoryId: string
   /** Inclusive period bounds as ISO dates ('2026-11-05'); '' = not set */
   from: string
   to: string
   page: number
}

type Actions = {
   setType: (type: TransactionTypeFilter) => void
   setAccountId: (accountId: string) => void
   setCategoryId: (categoryId: string) => void
   setFrom: (from: string) => void
   setTo: (to: string) => void
   setPage: (page: number) => void
   resetFilters: () => void
}

type TransactionsFilterStore = TransactionsFilterState & Actions

export const PAGE_SIZE = 8

const initialState: TransactionsFilterState = {
   type: 'all',
   accountId: 'all',
   categoryId: 'all',
   from: '',
   to: '',
   page: 1,
}

export const useTransactionsFilterStore = create<TransactionsFilterStore>(set => ({
   ...initialState,

   setType: type => set({ type, categoryId: 'all', page: 1 }),
   setAccountId: accountId => set({ accountId, page: 1 }),
   setCategoryId: categoryId => set({ categoryId, page: 1 }),
   setFrom: from => set({ from, page: 1 }),
   setTo: to => set({ to, page: 1 }),
   setPage: page => set({ page }),
   resetFilters: () => set({ ...initialState }),
}))
