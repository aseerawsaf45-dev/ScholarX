import { icons } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconName = keyof typeof icons;

export interface IconProps {
  name: IconName;
  size?: 16 | 20 | 24 | 32;
  className?: string;
}

export function Icon({ name, size = 24, className }: IconProps) {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon ${name} not found in lucide-react`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      className={cn("shrink-0", className)}
      strokeWidth={2}
    />
  );
}
