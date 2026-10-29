import { queryClient } from '@/shared/api/query-client'
import { clearAuthToken } from '@/shared/api/auth-token'
import { routes } from '@/shared/routes'

/** Clears the session and does a hard redirect so all query caches and state reset */
export function logout(): void {
   clearAuthToken()
   queryClient.clear()
   window.location.href = routes.login
}
