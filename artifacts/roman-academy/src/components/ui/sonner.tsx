"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-navy-900 group-[.toaster]:text-white group-[.toaster]:border-gold-500/20 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-ivory-100/60",
          actionButton:
            "group-[.toast]:bg-gold-400 group-[.toast]:text-navy-950",
          cancelButton:
            "group-[.toast]:bg-navy-800 group-[.toast]:text-ivory-100/70",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
