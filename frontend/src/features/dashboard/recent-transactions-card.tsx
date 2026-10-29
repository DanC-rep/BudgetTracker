import Link from 'next/link'
import { ArrowRight, ArrowRightLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { routes } from '@/shared/routes'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import type { RecentTransaction } from './model/dashboard'

type Props = {
   transactions: RecentTransaction[]
}

function AmountBadge({ transaction }: { transaction: RecentTransaction['transaction'] }) {
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

export function RecentTransactionsCard({ transactions }: Props) {
   return (
      <Card>
         <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-semibold">Последние операции</CardTitle>
            <Link
               href={routes.transactions}
               className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
               Все операции
               <ArrowRight className="size-4" />
            </Link>
         </CardHeader>
         <CardContent>
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className="w-36">Дата</TableHead>
                     <TableHead>Категория</TableHead>
                     <TableHead>Счёт</TableHead>
                     <TableHead className="w-40">Комментарий</TableHead>
                     <TableHead className="text-right">Сумма</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {transactions.map(({ transaction, category, account, toAccount }) => (
                     <TableRow key={transaction.id}>
                        <TableCell className="text-muted-foreground">{formatDateTime(transaction.date)}</TableCell>
                        <TableCell>
                           {transaction.type === 'transfer' ? (
                              <span className="flex items-center gap-2">
                                 <span className="size-2.5 rounded-full bg-muted-foreground" />
                                 Перевод
                              </span>
                           ) : (
                              category && (
                                 <span className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                                    {category.name}
                                 </span>
                              )
                           )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                           {transaction.type === 'transfer' && toAccount
                              ? `${account.name} → ${toAccount.name}`
                              : account.name}
                        </TableCell>
                        <TableCell className="max-w-40 truncate text-muted-foreground">
                           {transaction.comment ?? '—'}
                        </TableCell>
                        <TableCell className="text-right">
                           <AmountBadge transaction={transaction} />
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </CardContent>
      </Card>
   )
}
