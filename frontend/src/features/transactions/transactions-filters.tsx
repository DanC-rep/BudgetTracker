'use client'

import { RotateCcw, Search } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
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
import { getCategoryFilterOptions } from './model/transactions-list'

const typeOptions: { value: TransactionTypeFilter; label: string }[] = [
   { value: 'all', label: 'Все типы' },
   { value: 'income', label: 'Доход' },
   { value: 'expense', label: 'Расход' },
   { value: 'transfer', label: 'Перевод' },
]

type Props = {
   accounts: AccountWithBalance[]
   categories: Category[]
}

export function TransactionsFilters({ accounts, categories }: Props) {
   const { search, type, accountId, categoryId, setSearch, setType, setAccountId, setCategoryId, resetFilters } =
      useTransactionsFilterStore()

   const activeAccounts = accounts.filter(account => !account.isArchived)
   const categoryOptions = getCategoryFilterOptions(categories, type)

   return (
      <div className="flex flex-wrap items-center gap-2">
         <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
               value={search}
               onChange={event => setSearch(event.target.value)}
               placeholder="Поиск по комментарию, категории..."
               className="pl-8"
            />
         </div>

         <Select value={type} onValueChange={value => setType(value as TransactionTypeFilter)}>
            <SelectTrigger className="w-full sm:w-36">
               <SelectValue />
            </SelectTrigger>
            <SelectContent>
               {typeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                     {option.label}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>

         <Select value={accountId} onValueChange={value => value && setAccountId(value)}>
            <SelectTrigger className="w-full sm:w-44">
               <SelectValue />
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
               <SelectValue />
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
