import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'outline' | 'secondary' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-purple-600 text-white',
      outline: 'border border-white/10 text-white/60',
      secondary: 'bg-white/10 text-white/80',
    }
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors uppercase tracking-wider",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
