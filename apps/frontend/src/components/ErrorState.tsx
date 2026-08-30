interface ErrorStateProps {
  message?: string;
}

function ErrorState({
  message = 'Failed to load data. Check if the backend is running.',
}: ErrorStateProps) {
  return (
    <div className="bg-card rounded-card border border-border p-6 shadow-sm">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

export default ErrorState;