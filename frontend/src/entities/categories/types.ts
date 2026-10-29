export type CategoryType = 'expense' | 'income'

export type Category = {
   id: string
   name: string
   type: CategoryType
   color: string
   monthlyLimit: number | null
   isSystem: boolean
   isHidden: boolean
}
