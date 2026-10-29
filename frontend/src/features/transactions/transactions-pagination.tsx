'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

type Props = {
   page: number
   totalPages: number
   totalCount: number
   onPageChange: (page: number) => void
}

export function TransactionsPagination({ page, totalPages, totalCount, onPageChange }: Props) {
   return (
      <div className="flex items-center justify-between gap-2">
         <p className="text-sm text-muted-foreground">
            {totalCount === 0 ? 'Нет операций' : `Показано ${page} из ${totalPages} страниц · ${totalCount} операций`}
         </p>
         <div className="flex items-center gap-1">
            <Button
               variant="outline"
               size="icon"
               aria-label="Предыдущая страница"
               disabled={page <= 1}
               onClick={() => onPageChange(page - 1)}>
               <ChevronLeft />
            </Button>
            <Button
               variant="outline"
               size="icon"
               aria-label="Следующая страница"
               disabled={page >= totalPages}
               onClick={() => onPageChange(page + 1)}>
               <ChevronRight />
            </Button>
         </div>
      </div>
   )
}
