import { Icon } from "@/components/ui/icon";

export function LoadingState({ message = "Growing..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 w-full h-full min-h-[200px]">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-muted border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          <Icon name="Leaf" size={16} />
        </div>
      </div>
      <p className="text-muted-foreground font-medium animate-pulse">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 w-full h-full min-h-[200px] text-center px-4">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
        <Icon name="AlertTriangle" size={24} />
      </div>
      <h3 className="text-lg font-semibold mb-2">Error Occurred</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-primary font-medium hover:underline">
          Try Again
        </button>
      )}
    </div>
  );
}
