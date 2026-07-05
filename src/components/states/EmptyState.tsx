import { Icon, IconName } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = "FolderOpen", title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border rounded-xl bg-card">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
        <Icon name={icon} size={32} />
      </div>
      <h3 className="text-xl font-heading font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" className="shadow-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
