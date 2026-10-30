import { AccountWithBalance } from '@/entities/accounts/types'
import { Category } from '@/entities/categories/types'
import { Transaction } from './types'

/** Transaction joined with its category and accounts for display */
export type TransactionView = {
   transaction: Transaction
   category: Category | null
   account: AccountWithBalance
   toAccount: AccountWithBalance | null
}

export function toTransactionView(
   transaction: Transaction,
   accounts: AccountWithBalance[],
   categories: Category[],
): TransactionView {
   return {
      transaction,
      category: categories.find(category => category.id === transaction.categoryId) ?? null,
      account: accounts.find(account => account.id === transaction.accountId) as AccountWithBalance,
      toAccount: accounts.find(account => account.id === transaction.toAccountId) ?? null,
   }
}
