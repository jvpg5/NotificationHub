interface EmptyStateProps {
  title: string;
  description?: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="bg-card rounded-card border border-border p-6 shadow-sm text-center">
      <p className="text-card-foreground text-sm font-medium">{title}</p>
      {description && (
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      )}
    </div>
  );
}

export default EmptyState;