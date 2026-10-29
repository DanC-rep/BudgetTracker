'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi, LoginRequest } from '../api'
import { setAuthToken } from '@/shared/api/auth-token'
import { isApiRequestError } from '@/shared/api/errors'
import { routes } from '@/shared/routes'

export function useLogin() {
   const router = useRouter()

   const mutation = useMutation({
      mutationFn: (request: LoginRequest) => authApi.login(request),
      onSuccess: response => {
         setAuthToken(response.accessToken)
         toast.success(`Добро пожаловать, ${response.name}`)
         router.push(routes.home)
      },
      onError: error => {
         if (isApiRequestError(error)) {
            toast.error(error.firstMessage)
            return
         }

         toast.error('Произошла неизвестная ошибка. Попробуйте перезагрузить страницу.')
      },
   })

   return {
      login: mutation.mutate,
      isPending: mutation.isPending,
      error: isApiRequestError(mutation.error) ? mutation.error : null,
      isError: mutation.isError,
   }
}
