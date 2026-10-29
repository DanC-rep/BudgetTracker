'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeftRight, LayoutDashboard, Tags, Wallet, Landmark, LogOut } from 'lucide-react'
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/shared/components/ui/sidebar'
import { routes } from '@/shared/routes'
import { currentUser } from '@/shared/lib/mock-data'
import { ThemeToggle } from '@/features/theme/theme-toggle'

const navItems = [
   { title: 'Обзор', url: routes.home, icon: LayoutDashboard },
   { title: 'Операции', url: routes.transactions, icon: ArrowLeftRight },
   { title: 'Счета', url: routes.accounts, icon: Wallet },
   { title: 'Категории', url: routes.categories, icon: Tags },
]

export function AppSidebar() {
   const pathname = usePathname()

   return (
      <Sidebar collapsible="icon">
         <SidebarHeader>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton size="lg" render={<Link href={routes.home} />}>
                        <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                           <Landmark className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                           <span className="truncate font-semibold">BudgetTracker</span>
                           <span className="truncate text-xs text-muted-foreground">Личные финансы</span>
                        </div>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarHeader>

         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {navItems.map(item => (
                        <SidebarMenuItem key={item.title}>
                           <SidebarMenuButton
                              isActive={pathname === item.url}
                              tooltip={item.title}
                              render={<Link href={item.url} />}>
                              <item.icon />
                              <span>{item.title}</span>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                     ))}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>

         <SidebarFooter>
            <SidebarMenu>
               <SidebarMenuItem className="flex items-center gap-2">
                  <SidebarMenuButton
                     size="lg"
                     className="flex-1 cursor-default data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                     <div
                        className="flex aspect-square size-8 items-center justify-center rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: currentUser.avatarColor }}>
                        {currentUser.name[0]}
                     </div>
                     <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{currentUser.name}</span>
                        <span className="truncate text-xs text-muted-foreground">@{currentUser.login}</span>
                     </div>
                  </SidebarMenuButton>
                  <ThemeToggle />
                  <SidebarMenuButton
                     className="size-8 shrink-0 justify-center px-0"
                     aria-label="Выйти"
                     tooltip="Выйти"
                     render={<Link href={routes.login} />}>
                     <LogOut />
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarFooter>
      </Sidebar>
   )
}
