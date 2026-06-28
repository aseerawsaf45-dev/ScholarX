import { icons } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconName = keyof typeof icons;

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 24, className }: IconProps) {
  // Convert kebab-case or lowercase to PascalCase (e.g. alert-triangle -> AlertTriangle, loader -> Loader)
  const pascalName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') as IconName;

  // Safe fallback if it's already PascalCase or otherwise
  const LucideIcon = icons[pascalName] || icons[name as IconName];

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
