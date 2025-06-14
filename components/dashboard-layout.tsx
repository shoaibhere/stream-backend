"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Shield, Users, Tv, LogOut, BarChart3, Menu, Radio } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      toast({
        title: "Logged out successfully",
        description: "You have been securely logged out",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "Logout error",
        description: "Failed to logout properly",
        variant: "destructive",
      })
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Teams", href: "/dashboard/teams", icon: Users },
    { name: "Channels", href: "/dashboard/channels", icon: Radio },
    { name: "Live Matches", href: "/dashboard/matches", icon: Tv },
  ]

  if (!mounted) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar className="border-r border-gray-200 bg-white shadow-sm">
          <SidebarHeader className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">Football Admin</h1>
                <p className="text-xs text-gray-500">Streaming Dashboard</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu className="space-y-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="w-full justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-blue-50 data-[active=true]:bg-blue-100 text-blue-700"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <main className="flex-1 p-4 lg:p-8 bg-white">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
