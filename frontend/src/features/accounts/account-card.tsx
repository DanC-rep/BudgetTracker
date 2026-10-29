import { Archive } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { formatMoney } from '@/shared/lib/format'
import { accountTypeIcon, accountTypeLabel } from '@/entities/accounts/model'
import { AccountWithBalance } from '@/entities/accounts/types'

type Props = {
   account: AccountWithBalance
   onArchive: (accountId: string) => void
}

export function AccountCard({ account, onArchive }: Props) {
   const Icon = accountTypeIcon[account.type]

   return (
      <Card>
         <CardContent className="pt-6">
            <div className="flex items-start justify-between">
               <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
                     <Icon className="size-5" />
                  </div>
                  <div>
                     <p className="font-medium">{account.name}</p>
                     <p className="text-sm text-muted-foreground">{accountTypeLabel[account.type]}</p>
                  </div>
               </div>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">
               {formatMoney(account.balance)}
            </p>
            {account.balance !== account.initialBalance && (
               <p className="mt-1 text-sm text-muted-foreground">
                  начальный баланс: {formatMoney(account.initialBalance)}
               </p>
            )}
         </CardContent>
         <CardFooter className="border-t pt-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onArchive(account.id)}>
               <Archive />
               Архивировать
            </Button>
         </CardFooter>
      </Card>
   )
}
