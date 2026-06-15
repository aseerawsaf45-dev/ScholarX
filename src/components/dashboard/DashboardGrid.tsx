import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6", className)}>
      {children}
    </div>
  );
}

interface WidgetProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

const colSpanClasses: Record<number, string> = {
  1: "col-span-1 md:col-span-1 lg:col-span-1",
  2: "col-span-1 md:col-span-2 lg:col-span-2",
  3: "col-span-1 md:col-span-3 lg:col-span-3",
  4: "col-span-1 md:col-span-3 lg:col-span-4",
  5: "col-span-1 md:col-span-4 lg:col-span-5",
  6: "col-span-1 md:col-span-6 lg:col-span-6",
  7: "col-span-1 md:col-span-6 lg:col-span-7",
  8: "col-span-1 md:col-span-6 lg:col-span-8",
  9: "col-span-1 md:col-span-6 lg:col-span-9",
  10: "col-span-1 md:col-span-6 lg:col-span-10",
  11: "col-span-1 md:col-span-6 lg:col-span-11",
  12: "col-span-1 md:col-span-6 lg:col-span-12",
};

export function Widget({ children, className, colSpan = 4 }: WidgetProps) {
  return (
    <div className={cn(colSpanClasses[colSpan], "flex flex-col h-full", className)}>
      {children}
    </div>
  );
}
