import Link from 'next/link'
import { Landmark } from 'lucide-react'
import { routes } from '@/shared/routes'
import { ThemeToggle } from '@/features/theme/theme-toggle'

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
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
