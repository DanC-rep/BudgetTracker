import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { formatMoney } from '@/shared/lib/format'
import type { MonthStats } from './model/dashboard'

type Props = {
   totalBalance: number
   monthStats: MonthStats
}

export function BalanceCards({ totalBalance, monthStats }: Props) {
   return (
      <div className="grid gap-4 md:grid-cols-3">
         <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Общий баланс</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-3xl font-semibold tracking-tight">{formatMoney(totalBalance)}</p>
               <p className="mt-1 text-sm text-muted-foreground">по всем активным счетам</p>
            </CardContent>
         </Card>

         <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Доходы за месяц</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-3xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-500">
                  +{formatMoney(monthStats.income)}
               </p>
               <p className="mt-1 text-sm text-muted-foreground">все источники дохода</p>
            </CardContent>
         </Card>

         <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Расходы за месяц</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-3xl font-semibold tracking-tight text-red-600 dark:text-red-500">
                  −{formatMoney(monthStats.expense)}
               </p>
               <p className="mt-1 text-sm text-muted-foreground">
                  {monthStats.net >= 0 ? 'бюджет в плюсе' : 'расходы превышают доходы'}
               </p>
            </CardContent>
         </Card>
      </div>
   )
}
