"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const Sidebar = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <aside ref={ref} className={cn("flex flex-col translate-x-full", className)} {...props}>
      {children}
    </aside>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-4 py-2", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-auto", className)} {...props} />
))
SidebarContent.displayName = "SidebarContent"

const SidebarProvider = ({ children }) => {
  return <>{children}</>
}

export { Sidebar, SidebarHeader, SidebarContent, SidebarProvider }

