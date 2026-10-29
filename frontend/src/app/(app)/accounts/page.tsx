'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { AccountCard } from '@/features/accounts/account-card'
import { ArchivedAccountsList } from '@/features/accounts/archived-accounts-list'
import { CreateAccountDialog } from '@/features/accounts/create-account-dialog'
import { getTotalBalance } from '@/features/dashboard/model/dashboard'
import { formatMoney } from '@/shared/lib/format'
import { mockAccounts } from '@/shared/lib/mock-data'
import { AccountWithBalance } from '@/entities/accounts/types'

export default function AccountsPage() {
   // Temporary: local state over mocks. Will be replaced by react-query mutations once the backend integration starts.
   const [accounts, setAccounts] = useState<AccountWithBalance[]>(mockAccounts)
   const [createOpen, setCreateOpen] = useState(false)

   const activeAccounts = accounts.filter(account => !account.isArchived)
   const archivedAccounts = accounts.filter(account => account.isArchived)

   const handleCreate = (data: { name: string; type: AccountWithBalance['type']; initialBalance: number }) => {
      const account: AccountWithBalance = {
         id: `acc-${Date.now()}`,
         name: data.name,
         type: data.type,
         initialBalance: data.initialBalance,
         balance: data.initialBalance,
         isArchived: false,
      }

      setAccounts(current => [...current, account])
      toast.success(`Счёт «${data.name}» создан`)
   }

   const handleArchive = (accountId: string) => {
      const account = accounts.find(item => item.id === accountId)
      setAccounts(current => current.map(item => (item.id === accountId ? { ...item, isArchived: true } : item)))
      if (account) toast.success(`Счёт «${account.name}» архивирован`)
   }

   const handleRestore = (accountId: string) => {
      const account = accounts.find(item => item.id === accountId)
      setAccounts(current => current.map(item => (item.id === accountId ? { ...item, isArchived: false } : item)))
      if (account) toast.success(`Счёт «${account.name}» восстановлен`)
   }

   return (
      <div className="flex flex-1 flex-col gap-4 md:gap-6">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
               <h1 className="text-xl font-semibold tracking-tight">Счета</h1>
               <p className="text-sm text-muted-foreground">
                  Общий баланс: <span className="font-medium text-foreground tabular-nums">{formatMoney(getTotalBalance(accounts))}</span>
               </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
               <Plus />
               Создать счёт
            </Button>
         </div>

         <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeAccounts.map(account => (
               <AccountCard key={account.id} account={account} onArchive={handleArchive} />
            ))}
         </div>

         {activeAccounts.length === 0 && (
            <p className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
               Нет активных счетов. Создайте первый счёт.
            </p>
         )}

         <ArchivedAccountsList accounts={archivedAccounts} onRestore={handleRestore} />

         <CreateAccountDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
      </div>
   )
}
