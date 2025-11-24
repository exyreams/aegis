import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        destructive:
          "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-[#DC2626] [&>svg]:text-[#DC2626] *:data-[slot=alert-description]:text-[#B91C1C]",
        success:
          "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)] text-[#059669] [&>svg]:text-[#10B981] *:data-[slot=alert-description]:text-[#047857]",
        warning:
          "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] text-[#D97706] [&>svg]:text-[#F59E0B] *:data-[slot=alert-description]:text-[#B45309]",
        info: "bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.2)] text-[#2563EB] [&>svg]:text-[#3B82F6] *:data-[slot=alert-description]:text-[#1D4ED8]",
        rfq: "bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.15)] text-[#059669] [&>svg]:text-[#10B981] *:data-[slot=alert-description]:text-[#047857] py-2 px-3 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
