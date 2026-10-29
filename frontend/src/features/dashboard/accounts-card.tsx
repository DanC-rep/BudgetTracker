import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { routes } from '@/shared/routes'
import { formatMoney } from '@/shared/lib/format'
import { accountTypeIcon, accountTypeLabel } from '@/entities/accounts/model'
import type { AccountWithBalance } from '@/entities/accounts/types'

type Props = {
   accounts: AccountWithBalance[]
}

export function AccountsCard({ accounts }: Props) {
   return (
      <Card className="h-full">
         <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-semibold">Счета</CardTitle>
            <Link
               href={routes.accounts}
               className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
               Все счета
               <ArrowRight className="size-4" />
            </Link>
         </CardHeader>
         <CardContent className="space-y-3">
            {accounts.map(account => {
               const Icon = accountTypeIcon[account.type]

               return (
                  <div key={account.id} className="flex items-center gap-3">
                     <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
                        <Icon className="size-4" />
                     </div>
                     <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{accountTypeLabel[account.type]}</p>
                     </div>
                     <p className="text-sm font-semibold tabular-nums">{formatMoney(account.balance)}</p>
                  </div>
               )
            })}
         </CardContent>
      </Card>
   )
}
