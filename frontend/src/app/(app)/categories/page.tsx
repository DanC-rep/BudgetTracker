'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { CategoryCard } from '@/features/categories/category-card'
import { CategoryFormData, CategoryFormDialog } from '@/features/categories/category-form-dialog'
import { canDeleteCategory, getCategorySpent } from '@/entities/categories/model'
import { Category } from '@/entities/categories/types'
import { mockCategories, mockTransactions } from '@/shared/lib/mock-data'

export default function CategoriesPage() {
   // Temporary: local state over mocks. Will be replaced by react-query mutations once the backend integration starts.
   const [categories, setCategories] = useState<Category[]>(mockCategories)
   const [dialogOpen, setDialogOpen] = useState(false)
   const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)

   const month = new Date()

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

   const handleSubmit = (data: CategoryFormData) => {
      if (editingCategory) {
         setCategories(current =>
            current.map(category =>
               category.id === editingCategory.id
                  ? {
                       ...category,
                       name: data.name,
                       color: data.color,
                       monthlyLimit: data.type === 'expense' ? data.monthlyLimit : null,
                    }
                  : category,
            ),
         )
         toast.success(`Категория «${data.name}» обновлена`)
         return
      }

      const category: Category = {
         id: `cat-${Date.now()}`,
         name: data.name,
         type: data.type,
         color: data.color,
         monthlyLimit: data.type === 'expense' ? data.monthlyLimit : null,
         isSystem: false,
         isHidden: false,
      }

      setCategories(current => [...current, category])
      toast.success(`Категория «${data.name}» создана`)
   }

   const handleToggleHidden = (categoryId: string) => {
      const category = categories.find(item => item.id === categoryId)
      if (!category) return

      setCategories(current =>
         current.map(item => (item.id === categoryId ? { ...item, isHidden: !item.isHidden } : item)),
      )
      toast.success(category.isHidden ? `Категория «${category.name}» показана` : `Категория «${category.name}» скрыта`)
   }

   const handleDelete = (categoryId: string) => {
      const category = categories.find(item => item.id === categoryId)
      setCategories(current => current.filter(item => item.id !== categoryId))
      if (category) toast.success(`Категория «${category.name}» удалена`)
   }

   const renderGrid = (items: Category[]) => (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
         {items.map(category => (
            <CategoryCard
               key={category.id}
               category={category}
               spent={getCategorySpent(mockTransactions, category.id, month)}
               canDelete={canDeleteCategory(category, mockTransactions)}
               onEdit={openEditDialog}
               onToggleHidden={handleToggleHidden}
               onDelete={handleDelete}
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
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            category={editingCategory}
            onSubmit={handleSubmit}
         />
      </div>
   )
}
