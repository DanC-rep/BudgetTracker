'use client'

import { EyeOff, Eye, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import { formatMoney } from '@/shared/lib/format'
import { Category } from '@/entities/categories/types'

type Props = {
   category: Category
   /** Spent this month; only meaningful for expense categories */
   spent: number
   canDelete: boolean
   onEdit: (category: Category) => void
   onToggleHidden: (categoryId: string) => void
   onDelete: (categoryId: string) => void
}

export function CategoryCard({ category, spent, canDelete, onEdit, onToggleHidden, onDelete }: Props) {
   const limit = category.monthlyLimit
   const percent = limit !== null ? Math.min(100, Math.round((spent / limit) * 100)) : null

   return (
      <Card className={category.isHidden ? 'opacity-60' : ''}>
         <CardContent className="space-y-3 pt-6">
            <div className="flex items-start justify-between gap-2">
               <div className="flex min-w-0 items-center gap-3">
                  <span className="size-4 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                  <div className="min-w-0">
                     <p className="truncate font-medium">{category.name}</p>
                     <p className="text-sm text-muted-foreground">
                        {category.type === 'expense' ? 'Расход' : 'Доход'}
                     </p>
                  </div>
               </div>
               <div className="flex shrink-0 gap-1">
                  {category.isSystem && <Badge variant="secondary">системная</Badge>}
                  {category.isHidden && <Badge variant="outline">скрытая</Badge>}
               </div>
            </div>

            {category.type === 'expense' && limit !== null && percent !== null && (
               <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">потрачено за месяц</span>
                     <span
                        className={`tabular-nums ${percent >= 100 ? 'text-red-600 dark:text-red-500' : percent >= 85 ? 'text-amber-600 dark:text-amber-500' : ''}`}>
                        {formatMoney(spent)} / {formatMoney(limit)}
                     </span>
                  </div>
                  <Progress
                     value={percent}
                     className={
                        percent >= 100
                           ? '[&>div]:bg-red-500'
                           : percent >= 85
                             ? '[&>div]:bg-amber-500'
                             : '[&>div]:bg-muted-foreground'
                     }
                  />
               </div>
            )}

            {category.type === 'expense' && limit === null && (
               <p className="text-sm text-muted-foreground">без месячного лимита</p>
            )}
         </CardContent>

         <CardFooter className="justify-end gap-1 border-t pt-3">
            <Button variant="ghost" size="icon" aria-label="Изменить категорию" onClick={() => onEdit(category)}>
               <Pencil />
            </Button>
            <Button
               variant="ghost"
               size="icon"
               aria-label={category.isHidden ? 'Показать категорию' : 'Скрыть категорию'}
               onClick={() => onToggleHidden(category.id)}>
               {category.isHidden ? <Eye /> : <EyeOff />}
            </Button>
            <Button
               variant="ghost"
               size="icon"
               aria-label="Удалить категорию"
               disabled={!canDelete}
               title={canDelete ? undefined : 'Удалить можно только личную категорию без операций'}
               onClick={() => onDelete(category.id)}>
               <Trash2 />
            </Button>
         </CardFooter>
      </Card>
   )
}
