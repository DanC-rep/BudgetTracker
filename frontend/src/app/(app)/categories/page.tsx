'use client'

import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { CategoryCard } from '@/features/categories/category-card'
import { CategoryFormData, CategoryFormDialog } from '@/features/categories/category-form-dialog'
import {
   useCategories,
   useCreateCategory,
   useDeleteCategory,
   useSetCategoryHidden,
   useUpdateCategory,
} from '@/features/categories/model/use-categories'
import { useMonthlySummary } from '@/features/reports/model/use-reports'
import { Category } from '@/entities/categories/types'
import { SubmitOptions } from '@/shared/api/types'

const DEFAULT_CURRENCY = 'RUB'

export default function CategoriesPage() {
   const [dialogOpen, setDialogOpen] = useState(false)
   const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)

   const { categories, isPending, isError, error, refetch } = useCategories()
   const { createCategory, isPending: isSaving } = useCreateCategory()
   const { updateCategory } = useUpdateCategory()
   const { setHidden } = useSetCategoryHidden()
   const { deleteCategory } = useDeleteCategory()

   const now = new Date()
   const summary = useMonthlySummary(now.getFullYear(), now.getMonth() + 1)
   const spentByCategory = new Map((summary?.byCategory ?? []).map(item => [item.categoryId, item.total]))

   const expenseCategories = categories.filter(category => category.type === 'expense')
   const incomeCategories = categories.filter(category => category.type === 'income')

   const openCreateDialog = () => {
      setEditingCategory(undefined)
      setDialogOpen(true)
   }

   const openEditDialog = (category: Category) => {
      setEditingCategory(category)
      setDialogOpen(true)
   }

   const handleSubmit = (data: CategoryFormData, options: SubmitOptions) => {
      if (editingCategory) {
         const clearMonthlyLimit = data.monthlyLimit === null

         updateCategory(
            {
               categoryId: editingCategory.id,
               request: {
                  name: data.name,
                  color: data.color,
                  monthlyLimit: clearMonthlyLimit ? null : data.monthlyLimit,
                  clearMonthlyLimit,
                  currency: clearMonthlyLimit ? null : DEFAULT_CURRENCY,
               },
            },
            options,
         )
         return
      }

      const monthlyLimit = data.type === 'expense' ? data.monthlyLimit : null

      createCategory(
         {
            name: data.name,
            type: data.type,
            icon: null,
            color: data.color,
            monthlyLimit,
            currency: monthlyLimit !== null ? DEFAULT_CURRENCY : null,
         },
         options,
      )
   }

   if (isPending) {
      return (
         <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" />
            Загрузка категорий…
         </div>
      )
   }

   if (isError) {
      return (
         <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">{error?.firstMessage ?? 'Не удалось загрузить категории'}</p>
            <Button variant="outline" onClick={() => refetch()}>
               Повторить
            </Button>
         </div>
      )
   }

   const renderGrid = (items: Category[]) => (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
         {items.map(category => (
            <CategoryCard
               key={category.id}
               category={category}
               spent={spentByCategory.get(category.id) ?? 0}
               canDelete={!category.isSystem}
               onEdit={openEditDialog}
               onToggleHidden={categoryId =>
                  setHidden({ categoryId, hidden: !category.isHidden, name: category.name })
               }
               onDelete={categoryId => deleteCategory({ categoryId, name: category.name })}
            />
         ))}
      </div>
   )

   return (
      <div className="flex flex-1 flex-col gap-4 md:gap-6">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
               <h1 className="text-xl font-semibold tracking-tight">Категории</h1>
               <p className="text-sm text-muted-foreground">
                  {categories.filter(category => !category.isHidden).length} активных из {categories.length}
               </p>
            </div>
            <Button onClick={openCreateDialog}>
               <Plus />
               Создать категорию
            </Button>
         </div>

         <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Расходы</h2>
            {expenseCategories.length > 0 ? (
               renderGrid(expenseCategories)
            ) : (
               <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                  Нет категорий расходов
               </p>
            )}
         </section>

         <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Доходы</h2>
            {incomeCategories.length > 0 ? (
               renderGrid(incomeCategories)
            ) : (
               <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                  Нет категорий доходов
               </p>
            )}
         </section>

         <CategoryFormDialog
            key={editingCategory?.id ?? 'new'}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            category={editingCategory}
            onSubmit={handleSubmit}
            isPending={isSaving}
         />
      </div>
   )
}
