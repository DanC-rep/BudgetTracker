'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isApiRequestError } from '@/shared/api/errors'
import { accountsApi, accountsQueryOptions, CreateAccountRequest } from '@/entities/accounts/api'
import { AccountWithBalance } from '@/entities/accounts/types'

export function useAccounts(includeArchived = true) {
   const query = useQuery(accountsQueryOptions.all(includeArchived))

   return {
      accounts: query.data ?? [],
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

export function useCreateAccount() {
   const queryClient = useQueryClient()

   const mutation = useMutation({
      mutationFn: (request: CreateAccountRequest) => accountsApi.create(request),
      onSuccess: (created: AccountWithBalance) => {
         toast.success(`Счёт «${created.name}» создан`)
      },
      // no onError: the create dialog maps server validation onto form fields
      onSettled: () => queryClient.invalidateQueries({ queryKey: [accountsQueryOptions.baseKey] }),
   })

   return { createAccount: mutation.mutate, isPending: mutation.isPending }
}

export function useRenameAccount() {
   const queryClient = useQueryClient()

   const mutation = useMutation({
      mutationFn: (variables: { accountId: string; name: string }) => accountsApi.rename(variables.accountId, variables.name),
      onSuccess: (updated: AccountWithBalance) => {
         toast.success(`Счёт переименован в «${updated.name}»`)
      },
      // no onError: the rename dialog maps server validation onto form fields
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: [accountsQueryOptions.baseKey] })
         queryClient.invalidateQueries({ queryKey: ['reports'] })
      },
   })

   return { renameAccount: mutation.mutate, isPending: mutation.isPending }
}

export function useSetAccountArchived() {
   const queryClient = useQueryClient()

   const mutation = useMutation({
      mutationFn: (variables: { accountId: string; archived: boolean }) =>
         accountsApi.setArchived(variables.accountId, variables.archived),
      onSuccess: (updated: AccountWithBalance) => {
         toast.success(updated.isArchived ? `Счёт «${updated.name}» архивирован` : `Счёт «${updated.name}» восстановлен`)
      },
      onError: toastError,
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: [accountsQueryOptions.baseKey] })
         queryClient.invalidateQueries({ queryKey: ['reports'] })
      },
   })

   return { setArchived: mutation.mutate, isPending: mutation.isPending }
}
