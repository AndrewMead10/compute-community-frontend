import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors",
        ghost: "hover:bg-accent hover:text-accent-foreground transition-colors",
        link: "text-primary underline-offset-4 hover:underline transition-colors",
        primary: "relative transition-transform duration-250 hover:-translate-x-2 hover:-translate-y-2 bg-primary text-primary-foreground font-bold cursor-pointer after:content-[''] after:absolute after:inset-0 after:border-2 after:border-primary after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100 hover:after:translate-x-2 hover:after:translate-y-2",
        customSecondary: "relative transition-transform duration-250 hover:-translate-x-2 hover:-translate-y-2 bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary after:content-[''] after:absolute after:inset-0 after:border-2 after:border-secondary after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100 hover:after:translate-x-2 hover:after:translate-y-2 hover:after:border-secondary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
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
