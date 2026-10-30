'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/components/ui/sidebar'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { formatMonth } from '@/shared/lib/format'
import { AppSidebar } from '@/features/sidebar/app-sidebar'
import { useMonthStore } from './model/month-store'

export default function AppLayout({
   children,
}: Readonly<{
   children: React.ReactNode
}>) {
   const month = useMonthStore(state => state.month)
   const shiftMonth = useMonthStore(state => state.shiftMonth)

   return (
      <SidebarProvider>
         <AppSidebar />
         <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
               <SidebarTrigger className="-ml-1" />
               <Separator orientation="vertical" className="mr-2 h-4" />

               <div className="flex items-center gap-1 text-sm font-medium">
                  <Button
                     variant="ghost"
                     size="icon"
                     aria-label="Предыдущий месяц"
                     onClick={() => shiftMonth(-1)}>
                     <ChevronLeft />
                  </Button>
                  <span className="w-32 text-center capitalize">{formatMonth(month)}</span>
                  <Button
                     variant="ghost"
                     size="icon"
                     aria-label="Следующий месяц"
                     onClick={() => shiftMonth(1)}>
                     <ChevronRight />
                  </Button>
               </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">{children}</main>
         </SidebarInset>
      </SidebarProvider>
   )
}
