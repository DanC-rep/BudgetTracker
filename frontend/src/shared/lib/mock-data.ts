// Temporary mock data for layout development without a backend.
// Will be replaced by API calls (react-query) once the backend integration starts.

import { AccountWithBalance } from '@/entities/accounts/types'
import { Category } from '@/entities/categories/types'
import { Transaction } from '@/entities/transactions/types'

export const mockAccounts: AccountWithBalance[] = [
   { id: 'acc-1', name: 'Наличные', type: 'cash', initialBalance: 15000, balance: 23840.5, isArchived: false },
   { id: 'acc-2', name: 'Карта Сбер', type: 'card', initialBalance: 50000, balance: 87420.75, isArchived: false },
   { id: 'acc-3', name: 'Вклад Тинькофф', type: 'deposit', initialBalance: 200000, balance: 200000, isArchived: false },
   { id: 'acc-4', name: 'Старый кошелёк', type: 'other', initialBalance: 3000, balance: 0, isArchived: true },
]

export const mockCategories: Category[] = [
   { id: 'cat-1', name: 'Продукты', type: 'expense', color: '#22c55e', monthlyLimit: 30000, isSystem: true, isHidden: false },
   { id: 'cat-2', name: 'Транспорт', type: 'expense', color: '#3b82f6', monthlyLimit: 8000, isSystem: true, isHidden: false },
   { id: 'cat-3', name: 'Жильё', type: 'expense', color: '#a855f7', monthlyLimit: 45000, isSystem: true, isHidden: false },
   { id: 'cat-4', name: 'Развлечения', type: 'expense', color: '#f97316', monthlyLimit: 10000, isSystem: false, isHidden: false },
   { id: 'cat-5', name: 'Здоровье', type: 'expense', color: '#ef4444', monthlyLimit: null, isSystem: false, isHidden: false },
   { id: 'cat-6', name: 'Зарплата', type: 'income', color: '#14b8a6', monthlyLimit: null, isSystem: true, isHidden: false },
   { id: 'cat-7', name: 'Подработка', type: 'income', color: '#eab308', monthlyLimit: null, isSystem: false, isHidden: false },
   { id: 'cat-8', name: 'Кафе', type: 'expense', color: '#f472b6', monthlyLimit: null, isSystem: true, isHidden: true },
]

export const mockTransactions: Transaction[] = [
   { id: 'tx-1', type: 'income', amount: 145000, date: '2026-10-05T09:00:00', accountId: 'acc-2', categoryId: 'cat-6', comment: 'Октябрь' },
   { id: 'tx-2', type: 'expense', amount: 28500, date: '2026-10-03T10:15:00', accountId: 'acc-2', categoryId: 'cat-3', comment: 'Квартплата' },
   { id: 'tx-3', type: 'expense', amount: 3240.5, date: '2026-10-27T19:42:00', accountId: 'acc-2', categoryId: 'cat-1', comment: 'Пятёрочка' },
   { id: 'tx-4', type: 'expense', amount: 1120, date: '2026-10-27T13:05:00', accountId: 'acc-1', categoryId: 'cat-2', comment: 'Метро, недельный проездной' },
   { id: 'tx-5', type: 'expense', amount: 2400, date: '2026-10-26T20:10:00', accountId: 'acc-2', categoryId: 'cat-4', comment: 'Кино и попкорн' },
   { id: 'tx-6', type: 'transfer', amount: 10000, date: '2026-10-25T12:00:00', accountId: 'acc-2', toAccountId: 'acc-3', comment: 'На вклад' },
   { id: 'tx-7', type: 'expense', amount: 5870, date: '2026-10-24T18:30:00', accountId: 'acc-1', categoryId: 'cat-1', comment: 'Закупка на неделю' },
   { id: 'tx-8', type: 'income', amount: 15000, date: '2026-10-20T15:00:00', accountId: 'acc-1', categoryId: 'cat-7', comment: 'Фриланс-проект' },
   { id: 'tx-9', type: 'expense', amount: 3600, date: '2026-10-19T09:20:00', accountId: 'acc-2', categoryId: 'cat-5', comment: 'Аптека' },
   { id: 'tx-10', type: 'expense', amount: 890, date: '2026-10-18T08:45:00', accountId: 'acc-1', categoryId: 'cat-2', comment: 'Такси' },
   { id: 'tx-11', type: 'expense', amount: 4750, date: '2026-10-12T14:00:00', accountId: 'acc-2', categoryId: 'cat-4', comment: 'Концерт' },
   { id: 'tx-12', type: 'expense', amount: 21890, date: '2026-09-28T11:00:00', accountId: 'acc-2', categoryId: 'cat-3', comment: 'Квартплата за сентябрь' },
   { id: 'tx-13', type: 'expense', amount: 5120, date: '2026-09-15T19:30:00', accountId: 'acc-1', categoryId: 'cat-1', comment: 'Перекрёсток' },
]
