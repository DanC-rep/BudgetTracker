import { Link as LinkIcon, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Progress } from '@/shared/components/ui/progress'
import { formatMoney } from '@/shared/lib/format'
import type { BudgetStatusItem } from './model/dashboard'

type Props = {
   items: BudgetStatusItem[]
}

function getProgressClass(percent: number): string {
   if (percent >= 100) return 'text-red-600 dark:text-red-500'
   if (percent >= 85) return 'text-amber-600 dark:text-amber-500'
   return 'text-muted-foreground'
}

export function BudgetStatusCard({ items }: Props) {
   return (
      <Card className="h-full">
         <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-semibold">Бюджеты по категориям</CardTitle>
            {items.some(item => item.percent >= 85) && (
               <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
                  <TriangleAlert className="size-3.5" />
                  есть перерасход
               </span>
            )}
         </CardHeader>
         <CardContent className="space-y-4">
            {items.map(item => (
               <div key={item.category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                     <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: item.category.color }} />
                        {item.category.name}
                     </span>
                     <span className={`tabular-nums ${getProgressClass(item.percent)}`}>
                        {formatMoney(item.spent)} / {formatMoney(item.limit)}
                     </span>
                  </div>
                  <Progress
                     value={item.percent}
                     className={item.percent >= 100 ? '[&>div]:bg-red-500' : item.percent >= 85 ? '[&>div]:bg-amber-500' : ''}
                  />
               </div>
            ))}
            {items.length === 0 && (
               <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LinkIcon className="size-4" />
                  Нет категорий с месячным лимитом
               </p>
            )}
         </CardContent>
      </Card>
   )
}
