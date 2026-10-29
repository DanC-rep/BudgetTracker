import { Category } from '@/entities/categories/types'
import { Transaction } from '@/entities/transactions/types'
import { TransactionView, sortByDateDesc, toTransactionView } from '@/entities/transactions/view'
import { TransactionsFilterState } from './transactions-filter-store'

export type TransactionsListResult = {
   items: TransactionView[]
   totalCount: number
   page: number
   pageSize: number
   totalPages: number
}

function matchesSearch(view: TransactionView, search: string): boolean {
   const query = search.trim().toLowerCase()

   if (!query) return true

   const haystack = [
      view.transaction.comment,
      view.category?.name,
      view.account.name,
      view.toAccount?.name,
   ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

   return haystack.includes(query)
}

export function getTransactionsList(
   transactions: Transaction[],
   accounts: Parameters<typeof toTransactionView>[1],
   categories: Category[],
   filter: Pick<TransactionsFilterState, 'search' | 'type' | 'accountId' | 'categoryId' | 'page'>,
   pageSize: number,
): TransactionsListResult {
   const filtered = sortByDateDesc(transactions)
      .map(transaction => toTransactionView(transaction, accounts, categories))
      .filter(view => {
         if (filter.type !== 'all' && view.transaction.type !== filter.type) return false
         if (filter.accountId !== 'all' && view.transaction.accountId !== filter.accountId && view.transaction.toAccountId !== filter.accountId)
            return false
         if (filter.categoryId !== 'all' && view.transaction.categoryId !== filter.categoryId) return false

         return matchesSearch(view, filter.search)
      })

   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
   const page = Math.min(filter.page, totalPages)
   const items = filtered.slice((page - 1) * pageSize, page * pageSize)

   return { items, totalCount: filtered.length, page, pageSize, totalPages }
}

/** Category options for the filter: hidden excluded, narrowed by the selected type */
export function getCategoryFilterOptions(categories: Category[], type: TransactionsFilterState['type']): Category[] {
   return categories.filter(category => {
      if (category.isHidden) return false
      if (type === 'income' || type === 'expense') return category.type === type
      return true
   })
}
