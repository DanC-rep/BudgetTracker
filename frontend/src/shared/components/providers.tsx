'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { Toaster } from '@/shared/components/ui/sonner'
import { queryClient } from '@/shared/api/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
   return (
      <QueryClientProvider client={queryClient}>
         <TooltipProvider>
            {children}
            <Toaster position="top-center" duration={3000} richColors />
         </TooltipProvider>
      </QueryClientProvider>
   )
}
