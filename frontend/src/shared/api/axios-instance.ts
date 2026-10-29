import axios from 'axios'
import { routes } from '@/shared/routes'
import { clearAuthToken, getAuthToken } from './auth-token'
import { ApiRequestError, errorTypeFromStatus } from './errors'
import { isProblemDetailsBody } from './problem-details'

export const apiClient = axios.create({
   baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5094',
   headers: {
      'Content-Type': 'application/json',
   },
})

apiClient.interceptors.request.use(config => {
   const token = getAuthToken()

   if (token) {
      config.headers.Authorization = `Bearer ${token}`
   }

   return config
})

apiClient.interceptors.response.use(
   response => response,
   error => {
      if (axios.isAxiosError(error) && error.response) {
         const { status, data } = error.response

         if (status === 401 && typeof window !== 'undefined') {
            clearAuthToken()

            if (![routes.login, routes.register].includes(window.location.pathname as typeof routes.login)) {
               window.location.href = routes.login
            }
         }

         if (isProblemDetailsBody(data)) {
            const messages = data.errors?.length
               ? data.errors
               : [{ code: 'error', message: data.detail ?? data.title ?? 'Неизвестная ошибка' }]

            throw new ApiRequestError(status, {
               type: errorTypeFromStatus(status),
               messages,
            })
         }
      }

      return Promise.reject(error)
   },
)
