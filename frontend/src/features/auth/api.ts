import { apiClient } from '@/shared/api/axios-instance'

export type LoginRequest = {
   login: string
   password: string
}

export type RegisterRequest = {
   login: string
   email: string
   password: string
   name: string
}

export type AuthResponse = {
   userId: string
   login: string
   email: string
   name: string
   accessToken: string
}

export const authApi = {
   login: async (request: LoginRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('api/auth/login', request)
      return response.data
   },

   register: async (request: RegisterRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('api/auth/register', request)
      return response.data
   },
}
