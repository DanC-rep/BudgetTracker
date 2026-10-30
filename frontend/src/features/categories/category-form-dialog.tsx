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
import { cn } from 'cn'
import { applyServerFieldErrors } from '@/shared/api/form-errors'
import { SubmitOptions } from '@/shared/api/types'
import { categoryColorPresets, categoryTypeLabel } from '@/entities/categories/model'
import { Category, CategoryType } from '@/entities/categories/types'

const categoryFormSchema = z.object({
   name: z
      .string()
      .min(1, 'Название категории не может быть пустым')
      .max(30, 'Название категории не может превышать 30 символов'),
   type: z.enum(['expense', 'income']),
   color: z.string(),
   monthlyLimit: z.number().min(0, 'Лимит не может быть отрицательным').nullable(),
})

export type CategoryFormData = z.infer<typeof categoryFormSchema>

type Props = {
   open: boolean
   onOpenChange: (open: boolean) => void
   /** When provided, the dialog works in edit mode: type is locked, title changes */
   category?: Category
   onSubmit: (data: CategoryFormData, options: SubmitOptions) => void
   isPending?: boolean
}

export function CategoryFormDialog({ open, onOpenChange, category, onSubmit, isPending = false }: Props) {
   const isEdit = category !== undefined

   const {
      register,
      handleSubmit,
      reset,
      control,
      setError,
      formState: { errors },
   } = useForm<CategoryFormData>({
      defaultValues: category
         ? {
              name: category.name,
              type: category.type,
              color: category.color,
              monthlyLimit: category.monthlyLimit,
           }
         : {
              name: '',
              type: 'expense',
              color: categoryColorPresets[0],
              monthlyLimit: null,
           },
      resolver: zodResolver(categoryFormSchema),
   })

   const type = useWatch({ control, name: 'type' })

   const handleFormSubmit = (data: CategoryFormData) => {
      onSubmit(data, {
         onSuccess: () => {
            reset()
            onOpenChange(false)
         },
         onError: error => {
            const unmapped = applyServerFieldErrors(
               error,
               (field, message) => setError(field as keyof CategoryFormData, { type: 'server', message }),
               {
                  byInvalidField: { 'тип категории': 'type' },
                  byCode: {
                     'length.is.invalid': 'name',
                     'money.amount.must.be.positive': 'monthlyLimit',
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
               <DialogTitle>{isEdit ? 'Изменить категорию' : 'Новая категория'}</DialogTitle>
               <DialogDescription>
                  {isEdit ? `Категория типа «${categoryTypeLabel[category.type]}»` : 'Укажите название, тип и оформление'}
               </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="category-name">
                     Название
                  </label>
                  <Input id="category-name" placeholder="Например, Продукты" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
               </div>

               {!isEdit && (
                  <div className="space-y-2">
                     <label className="text-sm font-medium" htmlFor="category-type">
                        Тип
                     </label>
                     <Controller
                        control={control}
                        name="type"
                        render={({ field }) => (
                           <Select
                              value={field.value}
                              onValueChange={value => value && field.onChange(value as CategoryType)}>
                              <SelectTrigger id="category-type" className="w-full">
                                 <SelectValue>
                                    {(value: string) => categoryTypeLabel[value as CategoryType] ?? 'Выберите тип'}
                                 </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="expense">Расход</SelectItem>
                                 <SelectItem value="income">Доход</SelectItem>
                              </SelectContent>
                           </Select>
                        )}
                     />
                  </div>
               )}

               <div className="space-y-2">
                  <span className="text-sm font-medium">Цвет</span>
                  <Controller
                     control={control}
                     name="color"
                     render={({ field }) => (
                        <div className="flex flex-wrap gap-2">
                           {categoryColorPresets.map(color => (
                              <button
                                 key={color}
                                 type="button"
                                 aria-label={`Цвет ${color}`}
                                 onClick={() => field.onChange(color)}
                                 className={cn(
                                    'size-7 rounded-full transition-transform hover:scale-110',
                                    field.value === color && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
                                 )}
                                 style={{ backgroundColor: color }}
                              />
                           ))}
                        </div>
                     )}
                  />
               </div>

               {type === 'expense' && (
                  <div className="space-y-2">
                     <label className="text-sm font-medium" htmlFor="category-limit">
                        Месячный лимит, ₽
                     </label>
                     <Input
                        id="category-limit"
                        type="number"
                        min={0}
                        step="any"
                        placeholder="Без лимита"
                        {...register('monthlyLimit', {
                           setValueAs: value => (value === '' || value === null ? null : Number(value)),
                        })}
                     />
                     {errors.monthlyLimit && (
                        <p className="text-sm text-destructive">{errors.monthlyLimit.message}</p>
                     )}
                     <p className="text-xs text-muted-foreground">Оставьте пустым, чтобы не задавать лимит</p>
                  </div>
               )}

               <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                     Отмена
                  </Button>
                  <Button type="submit" disabled={isPending}>
                     {isEdit ? 'Сохранить' : 'Создать категорию'}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   )
}
