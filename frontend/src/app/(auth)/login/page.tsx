import Link from 'next/link'
import { LoginForm } from '@/features/auth/login-form'
import { routes } from '@/shared/routes'

export default function LoginPage() {
   return (
      <div className="space-y-4">
         <LoginForm />
         <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link href={routes.register} className="font-medium text-foreground underline-offset-4 hover:underline">
               Зарегистрироваться
            </Link>
         </p>
      </div>
   )
}
