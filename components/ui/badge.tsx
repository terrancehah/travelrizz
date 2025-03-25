import { cn } from "@/utils/cn"
import { VariantProps, cva } from "class-variance-authority"
import { HTMLAttributes } from "react"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent",
        outline: "border-gray-300 bg-transparent text-foreground hover:bg-gray-50",
        secondary: "bg-secondary text-secondary-foreground border-transparent",
        destructive: "bg-destructive text-destructive-foreground border-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
