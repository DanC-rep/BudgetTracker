'use client'

import { ArrowRightLeft } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { TransactionView } from '@/entities/transactions/view'

function AmountCell({ view }: { view: TransactionView }) {
   const { transaction } = view

   if (transaction.type === 'transfer') {
      return (
         <Badge variant="outline" className="gap-1 tabular-nums">
            <ArrowRightLeft className="size-3" />
            {formatMoney(transaction.amount)}
         </Badge>
      )
   }

   const isIncome = transaction.type === 'income'

   return (
      <span
         className={`font-medium tabular-nums ${isIncome ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
         {isIncome ? '+' : '−'}
         {formatMoney(transaction.amount)}
      </span>
   )
}

type Props = {
   items: TransactionView[]
}

export function TransactionsTable({ items }: Props) {
   return (
      <Table>
         <TableHeader>
            <TableRow>
               <TableHead className="w-36">Дата</TableHead>
               <TableHead>Категория</TableHead>
               <TableHead>Счёт</TableHead>
               <TableHead className="w-48">Комментарий</TableHead>
               <TableHead className="text-right">Сумма</TableHead>
            </TableRow>
         </TableHeader>
         <TableBody>
            {items.map(view => (
               <TableRow key={view.transaction.id}>
                  <TableCell className="text-muted-foreground">{formatDateTime(view.transaction.date)}</TableCell>
                  <TableCell>
                     {view.transaction.type === 'transfer' ? (
                        <span className="flex items-center gap-2">
                           <span className="size-2.5 rounded-full bg-muted-foreground" />
                           Перевод
                        </span>
                     ) : (
                        view.category && (
                           <span className="flex items-center gap-2">
                              <span className="size-2.5 rounded-full" style={{ backgroundColor: view.category.color }} />
                              {view.category.name}
                           </span>
                        )
                     )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                     {view.transaction.type === 'transfer' && view.toAccount
                        ? `${view.account.name} → ${view.toAccount.name}`
                        : view.account.name}
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">
                     {view.transaction.comment ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                     <AmountCell view={view} />
                  </TableCell>
               </TableRow>
            ))}
            {items.length === 0 && (
               <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                     Операции не найдены. Попробуйте изменить фильтры.
                  </TableCell>
               </TableRow>
            )}
         </TableBody>
      </Table>
   )
}
