export type TransactionType = 'income' | 'expense' | 'transfer'

export type Transaction = {
   id: string
   type: TransactionType
   amount: number
   currency: string
   date: string
   description: string | null
   accountId: string
   toAccountId: string | null
   categoryId: string | null
}
