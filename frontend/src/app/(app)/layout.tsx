'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AppLayout from '@/features/layout/app-layout'
import { routes } from '@/shared/routes'
import { useAuthToken } from '@/shared/hooks/use-auth-token'
import { useMounted } from '@/shared/hooks/use-mounted'

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
   const router = useRouter()
   const mounted = useMounted()
   const token = useAuthToken()

   const authorized = mounted && token !== null

   useEffect(() => {
      if (mounted && token === null) {
         router.replace(routes.login)
      }
   }, [mounted, token, router])

   // Render nothing until the token is known: no protected UI may flash before the redirect
   if (!authorized) {
      return (
         <div className="flex min-h-svh flex-1 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
         </div>
      )
   }

   return <AppLayout>{children}</AppLayout>
}
