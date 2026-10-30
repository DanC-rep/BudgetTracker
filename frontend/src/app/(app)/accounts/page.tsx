'use client'

import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { AccountCard } from '@/features/accounts/account-card'
import { ArchivedAccountsList } from '@/features/accounts/archived-accounts-list'
import { CreateAccountDialog, CreateAccountFormData } from '@/features/accounts/create-account-dialog'
import { RenameAccountDialog } from '@/features/accounts/rename-account-dialog'
import { useAccounts, useCreateAccount, useRenameAccount, useSetAccountArchived } from '@/features/accounts/model/use-accounts'
import { getTotalBalance } from '@/entities/accounts/model'
import { AccountWithBalance } from '@/entities/accounts/types'
import { formatMoney } from '@/shared/lib/format'
import { SubmitOptions } from '@/shared/api/types'

const DEFAULT_CURRENCY = 'RUB'

export default function AccountsPage() {
   const [createOpen, setCreateOpen] = useState(false)
   const [renamingAccount, setRenamingAccount] = useState<AccountWithBalance | undefined>(undefined)
   const { accounts, isPending, isError, error, refetch } = useAccounts()
   const { createAccount, isPending: isCreating } = useCreateAccount()
   const { renameAccount, isPending: isRenaming } = useRenameAccount()
   const { setArchived } = useSetAccountArchived()

   const activeAccounts = accounts.filter(account => !account.isArchived)
   const archivedAccounts = accounts.filter(account => account.isArchived)

   const handleCreate = (data: CreateAccountFormData, options: SubmitOptions) => {
      createAccount({ ...data, currency: DEFAULT_CURRENCY }, options)
   }

   const handleRename = (accountId: string, name: string, options: SubmitOptions) => {
      renameAccount({ accountId, name }, options)
   }

   if (isPending) {
      return (
         <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" />
            Загрузка счетов…
         </div>
      )
   }

   if (isError) {
      return (
         <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">{error?.firstMessage ?? 'Не удалось загрузить счета'}</p>
            <Button variant="outline" onClick={() => refetch()}>
               Повторить
            </Button>
         </div>
      )
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
               <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={setRenamingAccount}
                  onArchive={accountId => setArchived({ accountId, archived: true })}
               />
            ))}
         </div>

         {activeAccounts.length === 0 && (
            <p className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
               Нет активных счетов. Создайте первый счёт.
            </p>
         )}

         <ArchivedAccountsList accounts={archivedAccounts} onRestore={accountId => setArchived({ accountId, archived: false })} />

         <CreateAccountDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            onCreate={handleCreate}
            isPending={isCreating}
         />

         <RenameAccountDialog
            key={renamingAccount?.id ?? 'new'}
            open={renamingAccount !== undefined}
            onOpenChange={open => {
               if (!open) setRenamingAccount(undefined)
            }}
            account={renamingAccount}
            onSubmit={handleRename}
            isPending={isRenaming}
         />
      </div>
   )
}
