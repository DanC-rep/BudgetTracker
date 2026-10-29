export const routes = {
   home: '/',
   login: '/login',
   register: '/register',
   transactions: '/transactions',
   accounts: '/accounts',
   categories: '/categories',
} as const

export type Route = (typeof routes)[keyof typeof routes]
