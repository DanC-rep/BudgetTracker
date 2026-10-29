import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-instance'
import { CurrentUser } from './types'

export const usersApi = {
   getMe: async (): Promise<CurrentUser> => {
      const response = await apiClient.get<CurrentUser>('api/auth/me')
      return response.data
   },
}

export const usersQueryOptions = {
   baseKey: 'users',
   meOptions: () => {
      return queryOptions({
         queryFn: () => usersApi.getMe(),
         queryKey: [usersQueryOptions.baseKey, 'me'],
      })
   },
}
