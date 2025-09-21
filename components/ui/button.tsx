// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
        variant: {
            default: "bg-sky-blue/80 text-primary-foreground hover:bg-sky-blue/90 dark:bg-sky-700 dark:text-white dark:hover:bg-sky-500",
            destructive:
            "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-red-900/90 dark:text-red-100 dark:hover:bg-red-900",
            outline:
            "border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500",
            secondary:
            "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:text-gray-300 dark:hover:text-white",
            link: "text-primary underline-offset-4 hover:underline dark:text-sky-400 dark:hover:text-sky-300",
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        },
        },
        defaultVariants: {
        variant: "default",
        size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }