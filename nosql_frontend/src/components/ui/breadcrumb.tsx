import * as React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

const Breadcrumb = ({ children }: { children: React.ReactNode }) => <nav className="flex" aria-label="Breadcrumb">{children}</nav>
const BreadcrumbList = ({ children, className }: { children: React.ReactNode, className?: string }) => <ol className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-white/40 sm:gap-2.5", className)}>{children}</ol>
const BreadcrumbItem = ({ children, className }: { children: React.ReactNode, className?: string }) => <li className={cn("inline-flex items-center gap-1.5", className)}>{children}</li>
const BreadcrumbLink = ({ children, href, className }: { children: React.ReactNode, href: string, className?: string }) => <Link href={href} className={cn("transition-colors hover:text-white", className)}>{children}</Link>
const BreadcrumbPage = ({ children, className }: { children: React.ReactNode, className?: string }) => <span role="link" aria-disabled="true" aria-current="page" className={cn("font-bold text-white", className)}>{children}</span>
const BreadcrumbSeparator = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5 opacity-40", className)}>
    {children || <ChevronRight className="h-3 w-3" />}
  </li>
)

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator }
