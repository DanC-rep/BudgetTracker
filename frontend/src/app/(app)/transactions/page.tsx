'use client'

import { useDebounce } from 'use-debounce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { TransactionsFilters } from '@/features/transactions/transactions-filters'
import { TransactionsTable } from '@/features/transactions/transactions-table'
import { TransactionsPagination } from '@/features/transactions/transactions-pagination'
import { PAGE_SIZE, useTransactionsFilterStore } from '@/features/transactions/model/transactions-filter-store'
import { getTransactionsList } from '@/features/transactions/model/transactions-list'
import { mockAccounts, mockCategories, mockTransactions } from '@/shared/lib/mock-data'

export default function TransactionsPage() {
   const { search, type, accountId, categoryId, page, setPage } = useTransactionsFilterStore()

   const [debouncedSearch] = useDebounce(search, 300)

   // Temporary: computed from mocks. Will be replaced by a react-query hook once the backend integration starts.
   const result = getTransactionsList(
      mockTransactions,
      mockAccounts,
      mockCategories,
      { search: debouncedSearch, type, accountId, categoryId, page },
      PAGE_SIZE,
   )

   return (
      <div className="flex flex-1 flex-col gap-4 md:gap-6">
         <Card>
            <CardHeader className="pb-4">
               <CardTitle className="text-xl font-semibold tracking-tight">Операции</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <TransactionsFilters accounts={mockAccounts} categories={mockCategories} />
               <TransactionsTable items={result.items} />
               <TransactionsPagination
                  page={result.page}
                  totalPages={result.totalPages}
                  totalCount={result.totalCount}
                  onPageChange={setPage}
               />
            </CardContent>
         </Card>
      </div>
   )
}
