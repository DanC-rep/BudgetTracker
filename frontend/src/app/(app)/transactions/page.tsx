'use client'

import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { TransactionsFilters } from '@/features/transactions/transactions-filters'
import { TransactionsTable } from '@/features/transactions/transactions-table'
import { TransactionsPagination } from '@/features/transactions/transactions-pagination'
import { TransactionFormDialog, TransactionFormData } from '@/features/transactions/transaction-form-dialog'
import { PAGE_SIZE, useTransactionsFilterStore } from '@/features/transactions/model/transactions-filter-store'
import {
   useCreateTransaction,
   useDeleteTransaction,
   useTransactionsList,
   useUpdateTransaction,
} from '@/features/transactions/model/use-transactions'
import { useAccounts } from '@/features/accounts/model/use-accounts'
import { useCategories } from '@/features/categories/model/use-categories'
import { SubmitOptions } from '@/shared/api/types'
import { CreateTransactionPayload, UpdateTransactionRequest } from '@/entities/transactions/api'
import { Transaction } from '@/entities/transactions/types'

const DEFAULT_CURRENCY = 'RUB'

function toCreatePayload(data: TransactionFormData): CreateTransactionPayload {
   const description = data.description?.trim() ? data.description.trim() : null
   const base = { amount: data.amount, currency: DEFAULT_CURRENCY, date: data.date, description }

   if (data.type === 'transfer') {
      return { type: 'transfer', fromAccountId: data.accountId, toAccountId: data.toAccountId as string, ...base }
   }

   return { type: data.type, accountId: data.accountId, categoryId: data.categoryId as string, ...base }
}

function toUpdateRequest(data: TransactionFormData, transaction: Transaction): UpdateTransactionRequest {
   return {
      type: data.type,
      accountId: data.accountId,
      toAccountId: data.type === 'transfer' ? (data.toAccountId ?? null) : null,
      categoryId: data.type === 'transfer' ? null : (data.categoryId ?? null),
      amount: data.amount,
      currency: transaction.currency,
      date: data.date,
      description: data.description?.trim() ? data.description.trim() : null,
   }
}

export default function TransactionsPage() {
   const { type, accountId, categoryId, from, to, page, setPage } = useTransactionsFilterStore()
   const { accounts } = useAccounts()
   const { categories } = useCategories()
   const result = useTransactionsList({ type, accountId, categoryId, from, to, page }, PAGE_SIZE)
   const { createTransaction, isPending: isCreating } = useCreateTransaction()
   const { updateTransaction, isPending: isUpdating } = useUpdateTransaction()
   const { deleteTransaction, deletingId } = useDeleteTransaction()

   const [dialogOpen, setDialogOpen] = useState(false)
   const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined)

   const openCreateDialog = () => {
      setEditingTransaction(undefined)
      setDialogOpen(true)
   }

   const openEditDialog = (view: { transaction: Transaction }) => {
      setEditingTransaction(view.transaction)
      setDialogOpen(true)
   }

   const handleSubmit = (data: TransactionFormData, options: SubmitOptions) => {
      if (editingTransaction) {
         updateTransaction(
            { transactionId: editingTransaction.id, request: toUpdateRequest(data, editingTransaction) },
            options,
         )
         return
      }

      createTransaction(toCreatePayload(data), options)
   }

   if (result.isPending) {
      return (
         <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" />
            Загрузка операций…
         </div>
      )
   }

   if (result.isError) {
      return (
         <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">{result.error?.firstMessage ?? 'Не удалось загрузить операции'}</p>
            <Button variant="outline" onClick={() => result.refetch()}>
               Повторить
            </Button>
         </div>
      )
   }

   return (
      <div className="flex flex-1 flex-col gap-4 md:gap-6">
         <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
               <CardTitle className="text-xl font-semibold tracking-tight">Операции</CardTitle>
               <Button onClick={openCreateDialog}>
                  <Plus />
                  Добавить операцию
               </Button>
            </CardHeader>
            <CardContent className="space-y-4">
               <TransactionsFilters accounts={accounts} categories={categories} />
               <TransactionsTable
                  items={result.items}
                  onEdit={openEditDialog}
                  onDelete={deleteTransaction}
                  deletingId={deletingId}
               />
               <TransactionsPagination
                  page={result.page}
                  totalPages={result.totalPages}
                  totalCount={result.totalCount}
                  onPageChange={setPage}
               />
            </CardContent>
         </Card>

         <TransactionFormDialog
            key={editingTransaction?.id ?? 'new'}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            accounts={accounts}
            categories={categories}
            transaction={editingTransaction}
            onSubmit={handleSubmit}
            isPending={isCreating || isUpdating}
         />
      </div>
   )
}
