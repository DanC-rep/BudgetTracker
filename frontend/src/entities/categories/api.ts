import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-instance'
import { Category, CategoryType } from './types'

export type CreateCategoryRequest = {
   name: string
   type: CategoryType
   icon: null
   color: string
   monthlyLimit: number | null
   /** Required by the API when monthlyLimit is set */
   currency: string | null
}

export type UpdateCategoryRequest = {
   name?: string
   icon?: string
   color?: string
   monthlyLimit?: number | null
   clearMonthlyLimit: boolean
   currency?: string | null
}

export const categoriesApi = {
   getAll: async (includeHidden: boolean): Promise<Category[]> => {
      const response = await apiClient.get<Category[]>('api/categories', {
         params: { includeHidden },
      })
      return response.data
   },

   create: async (request: CreateCategoryRequest): Promise<Category> => {
      const response = await apiClient.post<Category>('api/categories', request)
      return response.data
   },

   update: async (categoryId: string, request: UpdateCategoryRequest): Promise<Category> => {
      const response = await apiClient.patch<Category>(`api/categories/${categoryId}`, request)
      return response.data
   },

   setHidden: async (categoryId: string, hidden: boolean): Promise<Category> => {
      const action = hidden ? 'hide' : 'show'
      const response = await apiClient.post<Category>(`api/categories/${categoryId}/${action}`)
      return response.data
   },

   delete: async (categoryId: string): Promise<void> => {
      await apiClient.delete(`api/categories/${categoryId}`)
   },
}

export const categoriesQueryOptions = {
   baseKey: 'categories',

   all: (includeHidden: boolean) =>
      queryOptions({
         queryFn: () => categoriesApi.getAll(includeHidden),
         queryKey: [categoriesQueryOptions.baseKey, 'all', includeHidden],
      }),
}
