'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { BalanceCards } from '@/features/dashboard/balance-cards'
import { AccountsCard } from '@/features/dashboard/accounts-card'
import { BudgetStatusCard } from '@/features/dashboard/budget-status-card'
import { RecentTransactionsCard } from '@/features/dashboard/recent-transactions-card'
import { toBudgetStatusItems, toMonthStats } from '@/features/dashboard/model/dashboard'
import { useMonthStore } from '@/features/layout/model/month-store'
import { useBudgetStatus, useDashboard, useMonthlySummary } from '@/features/reports/model/use-reports'
import { useAccounts } from '@/features/accounts/model/use-accounts'
import { useCategories } from '@/features/categories/model/use-categories'
import { toTransactionView } from '@/entities/transactions/view'

export default function HomePage() {
   const month = useMonthStore(state => state.month)
   const year = month.getFullYear()
   const monthNumber = month.getMonth() + 1

   const dashboard = useDashboard()
   const summary = useMonthlySummary(year, monthNumber)
   const budgetStatus = useBudgetStatus(year, monthNumber)
   const { accounts } = useAccounts()
   const { categories } = useCategories()

   if (dashboard.isPending) {
      return (
         <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" />
            Загрузка дашборда…
         </div>
      )
   }

   if (dashboard.isError || !dashboard.data) {
      return (
         <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">
               {dashboard.error?.firstMessage ?? 'Не удалось загрузить дашборд'}
            </p>
            <Button variant="outline" onClick={() => dashboard.refetch()}>
               Повторить
            </Button>
         </div>
      )
   }

   const activeAccounts = accounts.filter(account => !account.isArchived)
   const recentTransactions = dashboard.data.recentTransactions.map(transaction =>
      toTransactionView(transaction, accounts, categories),
   )

   return (
      <div className="flex flex-1 flex-col gap-4 md:gap-6">
         <BalanceCards totalBalance={dashboard.data.totalBalance.total} monthStats={toMonthStats(summary)} />

         <div className="grid gap-4 lg:grid-cols-2 md:gap-6">
            <AccountsCard accounts={activeAccounts} />
            <BudgetStatusCard items={toBudgetStatusItems(budgetStatus, categories)} />
         </div>

         <RecentTransactionsCard transactions={recentTransactions} />
      </div>
   )
}
