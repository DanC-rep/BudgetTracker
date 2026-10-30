'use client'

import { useForm, Controller } from 'react-hook-form'
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
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/shared/components/ui/select'
import { applyServerFieldErrors } from '@/shared/api/form-errors'
import { SubmitOptions } from '@/shared/api/types'
import { accountTypeLabel, accountTypeOptions } from '@/entities/accounts/model'
import { AccountType } from '@/entities/accounts/types'

const createAccountSchema = z.object({
   name: z
      .string()
      .min(1, 'Название счёта не может быть пустым')
      .max(30, 'Название счёта не может превышать 30 символов'),
   type: z.enum(['cash', 'card', 'deposit', 'other']),
   initialBalance: z.number().min(0, 'Начальный баланс не может быть отрицательным'),
})

export type CreateAccountFormData = z.infer<typeof createAccountSchema>

type Props = {
   open: boolean
   onOpenChange: (open: boolean) => void
   onCreate: (data: CreateAccountFormData, options: SubmitOptions) => void
   isPending?: boolean
}

export function CreateAccountDialog({ open, onOpenChange, onCreate, isPending = false }: Props) {
   const {
      register,
      handleSubmit,
      reset,
      control,
      setError,
      formState: { errors },
   } = useForm<CreateAccountFormData>({
      defaultValues: {
         name: '',
         type: 'card',
         initialBalance: 0,
      },
      resolver: zodResolver(createAccountSchema),
   })

   const onSubmit = (data: CreateAccountFormData) => {
      onCreate(data, {
         onSuccess: () => {
            reset()
            onOpenChange(false)
         },
         onError: error => {
            const unmapped = applyServerFieldErrors(
               error,
               (field, message) => setError(field as keyof CreateAccountFormData, { type: 'server', message }),
               {
                  byInvalidField: { 'тип счёта': 'type' },
                  byCode: {
                     'length.is.invalid': 'name',
                     'money.amount.must.be.positive': 'initialBalance',
                  },
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
               <DialogTitle>Новый счёт</DialogTitle>
               <DialogDescription>Укажите название, тип и начальный баланс счёта</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="account-name">
                     Название
                  </label>
                  <Input id="account-name" placeholder="Например, Карта Сбер" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="account-type">
                     Тип
                  </label>
                  <Controller
                     control={control}
                     name="type"
                     render={({ field }) => (
                        <Select value={field.value} onValueChange={value => value && field.onChange(value as AccountType)}>
                           <SelectTrigger id="account-type" className="w-full">
                              <SelectValue>
                                 {(value: string) => accountTypeLabel[value as AccountType] ?? 'Выберите тип'}
                              </SelectValue>
                           </SelectTrigger>
                           <SelectContent>
                              {accountTypeOptions.map(type => (
                                 <SelectItem key={type} value={type}>
                                    {accountTypeLabel[type]}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     )}
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="account-balance">
                     Начальный баланс, ₽
                  </label>
                  <Input
                     id="account-balance"
                     type="number"
                     min={0}
                     step="0.01"
                     {...register('initialBalance', { valueAsNumber: true })}
                  />
                  {errors.initialBalance && (
                     <p className="text-sm text-destructive">{errors.initialBalance.message}</p>
                  )}
               </div>

               <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                     Отмена
                  </Button>
                  <Button type="submit" disabled={isPending}>
                     Создать счёт
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   )
}
