'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Landmark } from 'lucide-react'
import { routes } from '@/shared/routes'
import { useAuthToken } from '@/shared/hooks/use-auth-token'
import { useMounted } from '@/shared/hooks/use-mounted'
import { ThemeToggle } from '@/features/theme/theme-toggle'

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
   const router = useRouter()
   const mounted = useMounted()
   const token = useAuthToken()

   // Already authenticated users have no business on auth pages
   useEffect(() => {
      if (mounted && token !== null) {
         router.replace(routes.home)
      }
   }, [mounted, token, router])

   return (
      <div className="relative flex min-h-svh flex-1 flex-col items-center justify-center p-4">
         <div className="absolute top-4 right-4">
            <ThemeToggle />
         </div>

         <div className="w-full max-w-sm">
            <div className="mb-6 flex flex-col items-center gap-2">
               <Link href={routes.home} className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                     <Landmark className="size-5" />
                  </div>
                  <span className="text-xl font-semibold tracking-tight">BudgetTracker</span>
               </Link>
               <p className="text-sm text-muted-foreground">Учёт личных расходов и бюджета</p>
            </div>

            {children}
         </div>
      </div>
   )
}
