interface SkeletonCardProps {
  lines?: number;
}

function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <div className="bg-card rounded-card border border-border p-6 shadow-sm animate-pulse space-y-3">
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-3/4" />
      {lines > 2 && <div className="h-4 bg-muted rounded w-1/2" />}
    </div>
  );
}

export default SkeletonCard;