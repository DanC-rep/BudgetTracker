import Link from 'next/link'
import { RegisterForm } from '@/features/auth/register-form'
import { routes } from '@/shared/routes'

export default function RegisterPage() {
   return (
      <div className="space-y-4">
         <RegisterForm />
         <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link href={routes.login} className="font-medium text-foreground underline-offset-4 hover:underline">
               Войти
            </Link>
         </p>
      </div>
   )
}
