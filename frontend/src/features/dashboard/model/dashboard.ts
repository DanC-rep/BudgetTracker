import { AccountWithBalance } from '@/entities/accounts/types'
import { Category } from '@/entities/categories/types'
import { Transaction } from '@/entities/transactions/types'
import { TransactionView, sortByDateDesc, toTransactionView } from '@/entities/transactions/view'

export type MonthStats = {
   income: number
   expense: number
   net: number
}

export type BudgetStatusItem = {
   category: Category
   spent: number
   limit: number
   percent: number
}

export type RecentTransaction = TransactionView

export type DashboardData = {
   totalBalance: number
   activeAccounts: AccountWithBalance[]
   monthStats: MonthStats
   budgetStatus: BudgetStatusItem[]
   recentTransactions: RecentTransaction[]
}

function isSameMonth(date: Date, reference: Date): boolean {
   return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth()
}

export function getTotalBalance(accounts: AccountWithBalance[]): number {
   return accounts.filter(account => !account.isArchived).reduce((sum, account) => sum + account.balance, 0)
}

export function getMonthStats(transactions: Transaction[], month: Date): MonthStats {
   let income = 0
   let expense = 0

   for (const transaction of transactions) {
      if (!isSameMonth(new Date(transaction.date), month)) continue

      if (transaction.type === 'income') income += transaction.amount
      if (transaction.type === 'expense') expense += transaction.amount
   }

   return { income, expense, net: income - expense }
}

export function getBudgetStatus(
   transactions: Transaction[],
   categories: Category[],
   month: Date,
): BudgetStatusItem[] {
   return categories
      .filter(category => !category.isHidden && category.type === 'expense' && category.monthlyLimit !== null)
      .map(category => {
         const spent = transactions
            .filter(
               transaction =>
                  transaction.type === 'expense' &&
                  transaction.categoryId === category.id &&
                  isSameMonth(new Date(transaction.date), month),
            )
            .reduce((sum, transaction) => sum + transaction.amount, 0)

         const limit = category.monthlyLimit as number

         return {
            category,
            spent,
            limit,
            percent: Math.min(100, Math.round((spent / limit) * 100)),
         }
      })
      .sort((a, b) => b.spent / b.limit - a.spent / a.limit)
}

export function getRecentTransactions(
   transactions: Transaction[],
   accounts: AccountWithBalance[],
   categories: Category[],
   count: number,
): RecentTransaction[] {
   return sortByDateDesc(transactions)
      .slice(0, count)
      .map(transaction => toTransactionView(transaction, accounts, categories))
}
