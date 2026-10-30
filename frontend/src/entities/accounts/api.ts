import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-instance'
import { AccountType, AccountWithBalance } from './types'

export type CreateAccountRequest = {
   name: string
   type: AccountType
   initialBalance: number
   currency: string
}

export const accountsApi = {
   getAll: async (includeArchived: boolean): Promise<AccountWithBalance[]> => {
      const response = await apiClient.get<AccountWithBalance[]>('api/accounts', {
         params: { includeArchived },
      })
      return response.data
   },

   create: async (request: CreateAccountRequest): Promise<AccountWithBalance> => {
      const response = await apiClient.post<AccountWithBalance>('api/accounts', request)
      return response.data
   },

   rename: async (accountId: string, name: string): Promise<AccountWithBalance> => {
      const response = await apiClient.patch<AccountWithBalance>(`api/accounts/${accountId}/name`, { name })
      return response.data
   },

   setArchived: async (accountId: string, archived: boolean): Promise<AccountWithBalance> => {
      const action = archived ? 'archive' : 'unarchive'
      const response = await apiClient.post<AccountWithBalance>(`api/accounts/${accountId}/${action}`)
      return response.data
   },
}

export const accountsQueryOptions = {
   baseKey: 'accounts',

   all: (includeArchived: boolean) =>
      queryOptions({
         queryFn: () => accountsApi.getAll(includeArchived),
         queryKey: [accountsQueryOptions.baseKey, 'all', includeArchived],
      }),
}
