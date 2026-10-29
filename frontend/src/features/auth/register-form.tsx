'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { routes } from '@/shared/routes'

const registerSchema = z
   .object({
      name: z
         .string()
         .min(1, 'Введите имя')
         .max(50, 'Имя не может превышать 50 символов'),
      login: z
         .string()
         .min(3, 'Логин должен содержать минимум 3 символа')
         .max(30, 'Логин не может превышать 30 символов'),
      email: z.email('Введите корректный email'),
      password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
      confirmPassword: z.string().min(1, 'Повторите пароль'),
   })
   .refine(data => data.password === data.confirmPassword, {
      message: 'Пароли не совпадают',
      path: ['confirmPassword'],
   })

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
   const router = useRouter()
   const [showPassword, setShowPassword] = useState(false)

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<RegisterFormData>({
      defaultValues: { name: '', login: '', email: '', password: '', confirmPassword: '' },
      resolver: zodResolver(registerSchema),
   })

   const onSubmit = (data: RegisterFormData) => {
      // Temporary: no backend yet. Will call the register API once integration starts.
      toast.success(`Аккаунт «${data.login}» зарегистрирован`)
      router.push(routes.home)
   }

   return (
      <Card>
         <CardHeader>
            <CardTitle className="text-lg">Регистрация</CardTitle>
            <CardDescription>Создайте аккаунт для учёта личного бюджета</CardDescription>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">
                     Имя
                  </label>
                  <Input id="name" placeholder="Как к вам обращаться" autoComplete="name" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="reg-login">
                     Логин
                  </label>
                  <Input
                     id="reg-login"
                     placeholder="Придумайте логин"
                     autoComplete="username"
                     {...register('login')}
                  />
                  {errors.login && <p className="text-sm text-destructive">{errors.login.message}</p>}
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                     Email
                  </label>
                  <Input
                     id="email"
                     type="email"
                     placeholder="you@example.com"
                     autoComplete="email"
                     {...register('email')}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="reg-password">
                     Пароль
                  </label>
                  <div className="relative">
                     <Input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Минимум 6 символов"
                        autoComplete="new-password"
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

               <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="confirm-password">
                     Повторите пароль
                  </label>
                  <Input
                     id="confirm-password"
                     type={showPassword ? 'text' : 'password'}
                     placeholder="Тот же пароль ещё раз"
                     autoComplete="new-password"
                     {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                     <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
               </div>

               <Button type="submit" className="w-full">
                  Зарегистрироваться
               </Button>
            </form>
         </CardContent>
      </Card>
   )
}
