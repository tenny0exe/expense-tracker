
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Target,
  Lightbulb,
  Settings,
  CreditCard,
  CalendarDays,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { UserNav } from "@/components/UserNav";
import { cn } from "@/lib/utils";
import type React from "react";
import { TransactionsProvider } from "@/context/TransactionsContext";
import { ProductivityProvider } from "@/context/ProductivityContext"; 
import { CurrencyProvider } from "@/context/CurrencyContext"; 

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transactions", icon: List },
  { href: "/dashboard/budgets", label: "Budgets", icon: Target },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/suggestions", label: "Smart Suggestions", icon: Lightbulb },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <TransactionsProvider>
      <CurrencyProvider> 
        <ProductivityProvider> 
          <SidebarProvider>
            <Sidebar variant="sidebar" collapsible="icon">
              <SidebarHeader className="p-4">
                {/* Text logo: shown when expanded, or when collapsed + hovered */}
                <Logo className="group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:group-hover:block" />
                {/* Icon logo: shown only when collapsed and NOT hovered */}
                <div className="hidden group-data-[collapsible=icon]:block group-data-[collapsible=icon]:group-hover:hidden">
                   <CreditCard size={28} className="text-primary mx-auto"/>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="p-2">
                  <SidebarMenu>
                       <SidebarMenuItem>
                          <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"} tooltip="Settings">
                              <Link href="/dashboard/settings">
                                  <Settings/>
                                  <span>Settings</span>
                              </Link>
                          </SidebarMenuButton>
                       </SidebarMenuItem>
                  </SidebarMenu>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
                  <div className="flex items-center">
                      <SidebarTrigger className="mr-2 md:hidden" />
                      <h1 className="text-xl font-semibold">
                          Expense Tracker
                      </h1>
                  </div>
                <UserNav />
              </header>
              <main className="flex-1 p-4 sm:p-6 space-y-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </ProductivityProvider>
      </CurrencyProvider>
    </TransactionsProvider>
  );
}
