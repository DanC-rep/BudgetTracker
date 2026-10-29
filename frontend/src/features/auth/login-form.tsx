'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { useLogin } from './model/use-login'

const loginSchema = z.object({
   login: z.string().min(1, 'Введите логин'),
   password: z.string().min(1, 'Введите пароль'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
   const [showPassword, setShowPassword] = useState(false)

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<LoginFormData>({
      defaultValues: { login: '', password: '' },
      resolver: zodResolver(loginSchema),
   })

   const { login, isPending } = useLogin()

   const onSubmit = (data: LoginFormData) => {
      login(data)
   }

   return (
      <Card>
         <CardHeader>
            <CardTitle className="text-lg">Вход</CardTitle>
            <CardDescription>Введите логин и пароль, чтобы продолжить</CardDescription>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="login">
                     Логин
                  </label>
                  <Input id="login" placeholder="Ваш логин" autoComplete="username" {...register('login')} />
                  {errors.login && <p className="text-sm text-destructive">{errors.login.message}</p>}
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                     Пароль
                  </label>
                  <div className="relative">
                     <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Ваш пароль"
                        autoComplete="current-password"
                        className="pr-10"
                        {...register('password')}
                     />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                        onClick={() => setShowPassword(current => !current)}>
                        {showPassword ? <EyeOff /> : <Eye />}
                     </Button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
               </div>

               <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Вход...' : 'Войти'}
               </Button>
            </form>
         </CardContent>
      </Card>
   )
}
