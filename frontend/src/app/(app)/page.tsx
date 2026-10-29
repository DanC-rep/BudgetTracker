import {
   getBudgetStatus,
   getMonthStats,
   getRecentTransactions,
   getTotalBalance,
} from '@/features/dashboard/model/dashboard'
import { BalanceCards } from '@/features/dashboard/balance-cards'
import { AccountsCard } from '@/features/dashboard/accounts-card'
import { BudgetStatusCard } from '@/features/dashboard/budget-status-card'
import { RecentTransactionsCard } from '@/features/dashboard/recent-transactions-card'
import { mockAccounts, mockCategories, mockTransactions } from '@/shared/lib/mock-data'

const RECENT_TRANSACTIONS_COUNT = 8

export default function HomePage() {
   // Temporary: view models are computed from mocks on the client.
   // Will be replaced by a react-query hook (GetDashboard) once the backend integration starts.
   const month = new Date()
   const activeAccounts = mockAccounts.filter(account => !account.isArchived)

   return (
      <div className="flex flex-1 flex-col gap-4 md:gap-6">
         <BalanceCards totalBalance={getTotalBalance(mockAccounts)} monthStats={getMonthStats(mockTransactions, month)} />

         <div className="grid gap-4 lg:grid-cols-2 md:gap-6">
            <AccountsCard accounts={activeAccounts} />
            <BudgetStatusCard items={getBudgetStatus(mockTransactions, mockCategories, month)} />
         </div>

         <RecentTransactionsCard
            transactions={getRecentTransactions(mockTransactions, mockAccounts, mockCategories, RECENT_TRANSACTIONS_COUNT)}
         />
      </div>
   )
}
