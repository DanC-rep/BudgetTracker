'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi, RegisterRequest } from '../api'
import { setAuthToken } from '@/shared/api/auth-token'
import { isApiRequestError } from '@/shared/api/errors'
import { routes } from '@/shared/routes'

export function useRegister() {
   const router = useRouter()

   const mutation = useMutation({
      mutationFn: (request: RegisterRequest) => authApi.register(request),
      onSuccess: response => {
         setAuthToken(response.accessToken)
         toast.success(`Аккаунт «${response.login}» создан. Добро пожаловать!`)
         router.push(routes.home)
      },
      onError: error => {
         if (isApiRequestError(error)) {
            toast.error(error.getAllMessages().join('\n'))
            return
         }

         toast.error('Произошла неизвестная ошибка. Попробуйте перезагрузить страницу.')
      },
   })

   return {
      register: mutation.mutate,
      isPending: mutation.isPending,
      error: isApiRequestError(mutation.error) ? mutation.error : null,
      isError: mutation.isError,
   }
}
