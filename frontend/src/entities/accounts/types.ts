export type AccountType = 'cash' | 'card' | 'deposit' | 'other'

export type Account = {
   id: string
   name: string
   type: AccountType
   initialBalance: number
   currency: string
   isArchived: boolean
}

/** Account with computed balance (initialBalance + operations), as returned by the API */
export type AccountWithBalance = Account & {
   balance: number
}
