'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/shared/components/ui/select'
import { AccountWithBalance } from '@/entities/accounts/types'
import { Category } from '@/entities/categories/types'
import { TransactionTypeFilter, useTransactionsFilterStore } from './model/transactions-filter-store'

const typeOptions: { value: TransactionTypeFilter; label: string }[] = [
   { value: 'all', label: 'Все типы' },
   { value: 'income', label: 'Доход' },
   { value: 'expense', label: 'Расход' },
   { value: 'transfer', label: 'Перевод' },
]

/** Category options for the filter: hidden excluded, narrowed by the selected type */
function getCategoryFilterOptions(categories: Category[], type: TransactionTypeFilter): Category[] {
   return categories.filter(category => {
      if (category.isHidden) return false
      if (type === 'income' || type === 'expense') return category.type === type
      return true
   })
}

type Props = {
   accounts: AccountWithBalance[]
   categories: Category[]
}

export function TransactionsFilters({ accounts, categories }: Props) {
   const { type, accountId, categoryId, from, to, setType, setAccountId, setCategoryId, setFrom, setTo, resetFilters } =
      useTransactionsFilterStore()

   const activeAccounts = accounts.filter(account => !account.isArchived)
   const categoryOptions = getCategoryFilterOptions(categories, type)

   return (
      <div className="flex flex-wrap items-center gap-2">
         <Select value={type} onValueChange={value => setType(value as TransactionTypeFilter)}>
            <SelectTrigger className="w-full sm:w-36">
               <SelectValue>
                  {(value: string) => typeOptions.find(option => option.value === value)?.label ?? 'Все типы'}
               </SelectValue>
            </SelectTrigger>
            <SelectContent>
               {typeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                     {option.label}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>

         <Input type="date" value={from} onChange={event => setFrom(event.target.value)} aria-label="Период с" className="w-full sm:w-36" />
         <Input type="date" value={to} onChange={event => setTo(event.target.value)} aria-label="Период по" className="w-full sm:w-36" />

         <Select value={accountId} onValueChange={value => value && setAccountId(value)}>
            <SelectTrigger className="w-full sm:w-44">
               <SelectValue>
                  {(value: string) =>
                     value === 'all' ? 'Все счета' : (activeAccounts.find(account => account.id === value)?.name ?? 'Все счета')
                  }
               </SelectValue>
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="all">Все счета</SelectItem>
               {activeAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                     {account.name}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>

         <Select value={categoryId} onValueChange={value => value && setCategoryId(value)}>
            <SelectTrigger className="w-full sm:w-44">
               <SelectValue>
                  {(value: string) => {
                     if (value === 'all') return 'Все категории'
                     const selected = categoryOptions.find(category => category.id === value)
                     if (!selected) return 'Все категории'
                     return (
                        <span className="flex items-center gap-2">
                           <span className="size-2.5 rounded-full" style={{ backgroundColor: selected.color }} />
                           {selected.name}
                        </span>
                     )
                  }}
               </SelectValue>
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="all">Все категории</SelectItem>
               {categoryOptions.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                     <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                        {category.name}
                     </span>
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>

         <Button variant="ghost" size="icon" aria-label="Сбросить фильтры" onClick={resetFilters}>
            <RotateCcw />
         </Button>
      </div>
   )
}
