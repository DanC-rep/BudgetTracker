'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isApiRequestError } from '@/shared/api/errors'
import {
   categoriesApi,
   categoriesQueryOptions,
   CreateCategoryRequest,
   UpdateCategoryRequest,
} from '@/entities/categories/api'

export function useCategories(includeHidden = true) {
   const query = useQuery(categoriesQueryOptions.all(includeHidden))

   return {
      categories: query.data ?? [],
      isPending: query.isPending,
      isError: query.isError,
      error: isApiRequestError(query.error) ? query.error : null,
      refetch: query.refetch,
   }
}

function toastError(error: unknown) {
   if (isApiRequestError(error)) {
      toast.error(error.firstMessage)
      return
   }

   toast.error('Произошла неизвестная ошибка. Попробуйте перезагрузить страницу.')
}

function useInvalidateCategories() {
   const queryClient = useQueryClient()

   return () => {
      queryClient.invalidateQueries({ queryKey: [categoriesQueryOptions.baseKey] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
   }
}

export function useCreateCategory() {
   const invalidate = useInvalidateCategories()

   const mutation = useMutation({
      mutationFn: (request: CreateCategoryRequest) => categoriesApi.create(request),
      onSuccess: created => toast.success(`Категория «${created.name}» создана`),
      // no onError: the form dialog maps server validation onto form fields
      onSettled: invalidate,
   })

   return { createCategory: mutation.mutate, isPending: mutation.isPending }
}

export function useUpdateCategory() {
   const invalidate = useInvalidateCategories()

   const mutation = useMutation({
      mutationFn: (variables: { categoryId: string; request: UpdateCategoryRequest }) =>
         categoriesApi.update(variables.categoryId, variables.request),
      onSuccess: updated => toast.success(`Категория «${updated.name}» обновлена`),
      // no onError: the form dialog maps server validation onto form fields
      onSettled: invalidate,
   })

   return { updateCategory: mutation.mutate, isPending: mutation.isPending }
}

export function useSetCategoryHidden() {
   const invalidate = useInvalidateCategories()

   const mutation = useMutation({
      mutationFn: (variables: { categoryId: string; hidden: boolean; name: string }) =>
         categoriesApi.setHidden(variables.categoryId, variables.hidden),
      onSuccess: (updated, variables) => {
         toast.success(updated.isHidden ? `Категория «${variables.name}» скрыта` : `Категория «${variables.name}» показана`)
      },
      onError: toastError,
      onSettled: invalidate,
   })

   return { setHidden: mutation.mutate, isPending: mutation.isPending }
}

export function useDeleteCategory() {
   const invalidate = useInvalidateCategories()

   const mutation = useMutation({
      mutationFn: (variables: { categoryId: string; name: string }) => categoriesApi.delete(variables.categoryId),
      onSuccess: (_data, variables) => toast.success(`Категория «${variables.name}» удалена`),
      onError: toastError,
      onSettled: invalidate,
   })

   return { deleteCategory: mutation.mutate, isPending: mutation.isPending }
}
