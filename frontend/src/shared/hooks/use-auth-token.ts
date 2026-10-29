import { useSyncExternalStore } from 'react'
import { AUTH_TOKEN_KEY } from '@/shared/api/auth-token'

function subscribe(callback: () => void): () => void {
   window.addEventListener('storage', callback)
   return () => window.removeEventListener('storage', callback)
}

function getSnapshot(): string | null {
   return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

function getServerSnapshot(): string | null {
   return null
}

/**
 * Auth token from localStorage, hydration-safe.
 * Server snapshot is always null; the real value appears after mount,
 * so guards must also gate on useMounted() to avoid rendering protected UI prematurely.
 */
export function useAuthToken(): string | null {
   return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
