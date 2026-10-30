'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { applyServerFieldErrors } from '@/shared/api/form-errors'
import { SubmitOptions } from '@/shared/api/types'
import { AccountWithBalance } from '@/entities/accounts/types'

const renameAccountSchema = z.object({
   name: z
      .string()
      .min(1, 'Название счёта не может быть пустым')
      .max(30, 'Название счёта не может превышать 30 символов'),
})

export type RenameAccountFormData = z.infer<typeof renameAccountSchema>

type Props = {
   open: boolean
   onOpenChange: (open: boolean) => void
   account: AccountWithBalance | undefined
   onSubmit: (accountId: string, name: string, options: SubmitOptions) => void
   isPending?: boolean
}

export function RenameAccountDialog({ open, onOpenChange, account, onSubmit, isPending = false }: Props) {
   const {
      register,
      handleSubmit,
      reset,
      setError,
      formState: { errors },
   } = useForm<RenameAccountFormData>({
      defaultValues: { name: account?.name ?? '' },
      resolver: zodResolver(renameAccountSchema),
   })

   const handleFormSubmit = (data: RenameAccountFormData) => {
      if (!account) return

      onSubmit(account.id, data.name, {
         onSuccess: () => {
            reset()
            onOpenChange(false)
         },
         onError: error => {
            const unmapped = applyServerFieldErrors(
               error,
               (field, message) => setError(field as 'name', { type: 'server', message }),
               {
                  byInvalidField: { 'название счёта': 'name' },
                  byCode: { 'length.is.invalid': 'name' },
               },
            )
            unmapped.forEach(message => toast.error(message))
         },
      })
   }

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Переименовать счёт</DialogTitle>
               <DialogDescription>Новое название будет показано во всех списках и отчётах</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="rename-account-name">
                     Название
                  </label>
                  <Input id="rename-account-name" placeholder="Например, Карта Сбер" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
               </div>

               <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                     Отмена
                  </Button>
                  <Button type="submit" disabled={isPending || !account}>
                     Сохранить
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   )
}
