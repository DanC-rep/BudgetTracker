'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/components/ui/sidebar'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { Toaster } from '@/shared/components/ui/sonner'
import { queryClient } from '@/shared/api/query-client'
import { formatMonth } from '@/shared/lib/format'
import { AppSidebar } from '@/features/sidebar/app-sidebar'

function shiftMonth(date: Date, delta: number): Date {
   return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

export default function AppLayout({
   children,
}: Readonly<{
   children: React.ReactNode
}>) {
   // Temporary: the selected month will come from a filter store once backend integration starts
   const [month, setMonth] = useState(() => new Date())

   return (
      <QueryClientProvider client={queryClient}>
         <TooltipProvider>
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
                           onClick={() => setMonth(current => shiftMonth(current, -1))}>
                           <ChevronLeft />
                        </Button>
                        <span className="w-32 text-center capitalize">{formatMonth(month)}</span>
                        <Button
                           variant="ghost"
                           size="icon"
                           aria-label="Следующий месяц"
                           onClick={() => setMonth(current => shiftMonth(current, 1))}>
                           <ChevronRight />
                        </Button>
                     </div>
                  </header>
                  <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">{children}</main>
               </SidebarInset>
               <Toaster position="top-center" duration={3000} richColors />
            </SidebarProvider>
         </TooltipProvider>
      </QueryClientProvider>
   )
}
