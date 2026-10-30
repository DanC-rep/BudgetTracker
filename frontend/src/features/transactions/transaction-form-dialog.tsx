'use client'

import { useForm, Controller, useWatch } from 'react-hook-form'
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
import { AccountWithBalance } from '@/entities/accounts/types'
import { Category } from '@/entities/categories/types'
import { Transaction, TransactionType } from '@/entities/transactions/types'

const transactionFormSchema = z
   .object({
      type: z.enum(['income', 'expense', 'transfer']),
      amount: z.number().positive('Сумма должна быть больше нуля'),
      date: z.string().min(1, 'Укажите дату'),
      accountId: z.string().min(1, 'Выберите счёт'),
      toAccountId: z.string().optional(),
      categoryId: z.string().optional(),
      description: z.string().max(200, 'Комментарий не может превышать 200 символов').optional(),
   })
   .superRefine((data, context) => {
      if (data.type === 'transfer') {
         if (!data.toAccountId) {
            context.addIssue({ code: 'custom', path: ['toAccountId'], message: 'Выберите счёт зачисления' })
         } else if (data.toAccountId === data.accountId) {
            context.addIssue({ code: 'custom', path: ['toAccountId'], message: 'Счёт зачисления совпадает со счётом списания' })
         }
      } else if (!data.categoryId) {
         context.addIssue({ code: 'custom', path: ['categoryId'], message: 'Выберите категорию' })
      }
   })

export type TransactionFormData = z.infer<typeof transactionFormSchema>

const typeOptions: { value: TransactionType; label: string }[] = [
   { value: 'expense', label: 'Расход' },
   { value: 'income', label: 'Доход' },
   { value: 'transfer', label: 'Перевод' },
]

const typeLabel: Record<TransactionType, string> = {
   income: 'Доход',
   expense: 'Расход',
   transfer: 'Перевод',
}

function today(): string {
   const now = new Date()
   const month = String(now.getMonth() + 1).padStart(2, '0')
   const day = String(now.getDate()).padStart(2, '0')
   return `${now.getFullYear()}-${month}-${day}`
}

type Props = {
   open: boolean
   onOpenChange: (open: boolean) => void
   accounts: AccountWithBalance[]
   categories: Category[]
   /** When provided, the dialog works in edit mode */
   transaction?: Transaction
   onSubmit: (data: TransactionFormData, options: SubmitOptions) => void
   isPending?: boolean
}

export function TransactionFormDialog({
   open,
   onOpenChange,
   accounts,
   categories,
   transaction,
   onSubmit,
   isPending = false,
}: Props) {
   const isEdit = transaction !== undefined

   const {
      register,
      handleSubmit,
      reset,
      control,
      setError,
      formState: { errors },
   } = useForm<TransactionFormData>({
      defaultValues: transaction
         ? {
              type: transaction.type,
              amount: transaction.amount,
              date: transaction.date.slice(0, 10),
              accountId: transaction.accountId,
              toAccountId: transaction.toAccountId ?? undefined,
              categoryId: transaction.categoryId ?? undefined,
              description: transaction.description ?? '',
           }
         : {
              type: 'expense',
              amount: 0,
              date: today(),
              accountId: '',
              toAccountId: undefined,
              categoryId: undefined,
              description: '',
           },
      resolver: zodResolver(transactionFormSchema),
   })

   const type = useWatch({ control, name: 'type' })
   const accountId = useWatch({ control, name: 'accountId' })

   const activeAccounts = accounts.filter(account => !account.isArchived)
   const toAccountOptions = activeAccounts.filter(account => account.id !== accountId)
   const categoryOptions = categories.filter(category => {
      if (type === 'transfer') return false
      if (category.type !== type) return false
      // In edit mode keep the current category selectable even if it was hidden
      if (isEdit && category.id === transaction.categoryId) return true
      return !category.isHidden
   })

   const handleFormSubmit = (data: TransactionFormData) => {
      onSubmit(data, {
         onSuccess: () => {
            reset()
            onOpenChange(false)
         },
         onError: error => {
            const unmapped = applyServerFieldErrors(
               error,
               (field, message) => setError(field as keyof TransactionFormData, { type: 'server', message }),
               {
                  byInvalidField: {
                     'тип операции': 'type',
                     'счёт зачисления': 'toAccountId',
                     'счёт': 'accountId',
                     'категория': 'categoryId',
                  },
                  byCode: {
                     'money.amount.must.be.positive': 'amount',
                     'transaction.category.type.mismatch': 'categoryId',
                     'transaction.account.archived': 'accountId',
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
               <DialogTitle>{isEdit ? 'Изменить операцию' : 'Новая операция'}</DialogTitle>
               <DialogDescription>
                  {isEdit ? `Тип операции: ${typeLabel[transaction.type]}. Поля можно менять целиком.` : 'Укажите тип, сумму, дату и счёт'}
               </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
               {!isEdit && (
                  <div className="space-y-2">
                     <label className="text-sm font-medium" htmlFor="tx-type">
                        Тип
                     </label>
                     <Controller
                        control={control}
                        name="type"
                        render={({ field }) => (
                           <Select value={field.value} onValueChange={value => value && field.onChange(value as TransactionType)}>
                              <SelectTrigger id="tx-type" className="w-full">
                                 <SelectValue>{(value: string) => typeLabel[value as TransactionType]}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                 {typeOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                       {option.label}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        )}
                     />
                     {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                  </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium" htmlFor="tx-amount">
                        Сумма, ₽
                     </label>
                     <Input
                        id="tx-amount"
                        type="number"
                        min={0}
                        step="0.01"
                        {...register('amount', { valueAsNumber: true })}
                     />
                     {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-medium" htmlFor="tx-date">
                        Дата
                     </label>
                     <Input id="tx-date" type="date" {...register('date')} />
                     {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="tx-account">
                     {type === 'transfer' ? 'Счёт списания' : 'Счёт'}
                  </label>
                  <Controller
                     control={control}
                     name="accountId"
                     render={({ field }) => (
                        <Select value={field.value} onValueChange={value => value && field.onChange(value)}>
                           <SelectTrigger id="tx-account" className="w-full">
                              <SelectValue placeholder="Выберите счёт">
                                 {(value: string | null) => activeAccounts.find(account => account.id === value)?.name ?? 'Выберите счёт'}
                              </SelectValue>
                           </SelectTrigger>
                           <SelectContent>
                              {activeAccounts.map(account => (
                                 <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     )}
                  />
                  {errors.accountId && <p className="text-sm text-destructive">{errors.accountId.message}</p>}
               </div>

               {type === 'transfer' && (
                  <div className="space-y-2">
                     <label className="text-sm font-medium" htmlFor="tx-to-account">
                        Счёт зачисления
                     </label>
                     <Controller
                        control={control}
                        name="toAccountId"
                        render={({ field }) => (
                           <Select value={field.value} onValueChange={value => field.onChange(value)}>
                              <SelectTrigger id="tx-to-account" className="w-full">
                                 <SelectValue placeholder="Выберите счёт">
                                    {(value: string | null) => toAccountOptions.find(account => account.id === value)?.name ?? 'Выберите счёт'}
                                 </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                 {toAccountOptions.map(account => (
                                    <SelectItem key={account.id} value={account.id}>
                                       {account.name}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        )}
                     />
                     {errors.toAccountId && <p className="text-sm text-destructive">{errors.toAccountId.message}</p>}
                  </div>
               )}

               {type !== 'transfer' && (
                  <div className="space-y-2">
                     <label className="text-sm font-medium" htmlFor="tx-category">
                        Категория
                     </label>
                     <Controller
                        control={control}
                        name="categoryId"
                        render={({ field }) => (
                           <Select value={field.value} onValueChange={value => field.onChange(value)}>
                              <SelectTrigger id="tx-category" className="w-full">
                                 <SelectValue placeholder="Выберите категорию">
                                    {(value: string | null) => {
                                       const selected = categoryOptions.find(category => category.id === value)
                                       if (!selected) return 'Выберите категорию'
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
                        )}
                     />
                     {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
                  </div>
               )}

               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="tx-description">
                     Комментарий
                  </label>
                  <Input id="tx-description" placeholder="Необязательно" {...register('description')} />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
               </div>

               <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                     Отмена
                  </Button>
                  <Button type="submit" disabled={isPending}>
                     {isEdit ? 'Сохранить' : 'Добавить операцию'}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   )
}
