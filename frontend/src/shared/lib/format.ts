// Date formatting is done with local month name tables instead of Intl.DateTimeFormat:
// ICU data differs between Node (SSR) and browsers, which breaks hydration on date-formatted text.

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

const MONTHS_LONG = [
   'январь',
   'февраль',
   'март',
   'апрель',
   'май',
   'июнь',
   'июль',
   'август',
   'сентябрь',
   'октябрь',
   'ноябрь',
   'декабрь',
]

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
   style: 'currency',
   currency: 'RUB',
   maximumFractionDigits: 2,
})

export function formatMoney(amount: number): string {
   return moneyFormatter.format(amount)
}

export function formatDate(date: string | Date): string {
   const parsed = new Date(date)
   return `${parsed.getDate()} ${MONTHS_SHORT[parsed.getMonth()]}`
}

export function formatDateTime(date: string | Date): string {
   const parsed = new Date(date)
   const hours = String(parsed.getHours()).padStart(2, '0')
   const minutes = String(parsed.getMinutes()).padStart(2, '0')

   return `${formatDate(parsed)}, ${hours}:${minutes}`
}

export function formatMonth(date: string | Date): string {
   const parsed = new Date(date)
   const month = MONTHS_LONG[parsed.getMonth()]

   return `${month[0].toUpperCase()}${month.slice(1)} ${parsed.getFullYear()}`
}
