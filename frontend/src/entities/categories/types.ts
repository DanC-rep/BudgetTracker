export type CategoryType = 'expense' | 'income'

export type Category = {
   id: string
   name: string
   type: CategoryType
   icon: string | null
   color: string
   monthlyLimit: number | null
   limitCurrency: string | null
   isSystem: boolean
   isHidden: boolean
   isPersonal: boolean
}
