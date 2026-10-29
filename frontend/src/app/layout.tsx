import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/shared/components/theme-provider'

const geistSans = Geist({
   variable: '--font-sans',
   subsets: ['latin'],
})

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
})

export const metadata = {
   title: 'BudgetTracker',
   description: 'Приложение для учёта личных расходов и бюджета',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
   return (
      <html lang="ru" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
         <body className="min-h-full flex flex-col bg-background text-foreground">
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
               {children}
            </ThemeProvider>
         </body>
      </html>
   )
}
