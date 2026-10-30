import { Banknote, CreditCard, PiggyBank, Wallet } from 'lucide-react'
import { AccountType, AccountWithBalance } from './types'

export const accountTypeIcon: Record<AccountType, typeof Wallet> = {
   cash: Banknote,
   card: CreditCard,
   deposit: PiggyBank,
   other: Wallet,
}

export const accountTypeLabel: Record<AccountType, string> = {
   cash: 'Наличные',
   card: 'Карта',
   deposit: 'Вклад',
   other: 'Прочее',
}

export const accountTypeOptions: AccountType[] = ['cash', 'card', 'deposit', 'other']

export function getTotalBalance(accounts: AccountWithBalance[]): number {
   return accounts.filter(account => !account.isArchived).reduce((sum, account) => sum + account.balance, 0)
}
