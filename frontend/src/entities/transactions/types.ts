export type TransactionType = 'income' | 'expense' | 'transfer'

export type Transaction = {
   id: string
   type: TransactionType
   amount: number
   date: string
   accountId: string
   toAccountId?: string
   categoryId?: string
   comment?: string
}
