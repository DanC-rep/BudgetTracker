import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/** True only after the component has mounted on the client (server snapshot is always false) */
export function useMounted(): boolean {
   return useSyncExternalStore(emptySubscribe, () => true, () => false)
}
