import { ArchiveRestore } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { formatMoney } from '@/shared/lib/format'
import { accountTypeIcon, accountTypeLabel } from '@/entities/accounts/model'
import { AccountWithBalance } from '@/entities/accounts/types'

type Props = {
   accounts: AccountWithBalance[]
   onRestore: (accountId: string) => void
}

export function ArchivedAccountsList({ accounts, onRestore }: Props) {
   if (accounts.length === 0) return null

   return (
      <section className="space-y-3">
         <h2 className="text-sm font-medium text-muted-foreground">
            Архивные счета ({accounts.length})
         </h2>
         <div className="rounded-md border">
            {accounts.map((account, index) => {
               const Icon = accountTypeIcon[account.type]

               return (
                  <div
                     key={account.id}
                     className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? 'border-t' : ''}`}>
                     <Icon className="size-4 text-muted-foreground" />
                     <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{accountTypeLabel[account.type]}</p>
                     </div>
                     <p className="text-sm text-muted-foreground tabular-nums">{formatMoney(account.balance)}</p>
                     <Button variant="ghost" size="sm" onClick={() => onRestore(account.id)}>
                        <ArchiveRestore />
                        Восстановить
                     </Button>
                  </div>
               )
            })}
         </div>
      </section>
   )
}
