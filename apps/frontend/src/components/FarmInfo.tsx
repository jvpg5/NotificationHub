import { Building2 } from 'lucide-react';
import { useFarm } from '../hooks/useFarm';
import SkeletonCard from './SkeletonCard';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

function FarmInfo() {
  const { data, isLoading, isError } = useFarm();

  if (isLoading) return <SkeletonCard />;
  if (isError) return <ErrorState />;
  if (!data)
    return (
      <EmptyState
        title="No farm data"
        description="Run the seed script to populate the database."
      />
    );

  return (
    <div className="bg-card rounded-card border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-titulo text-[15px] font-semibold text-card-foreground">
            {data.name}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">{data.producer}</p>
          <p className="text-muted-foreground text-sm">{data.phone}</p>
        </div>
        <Building2 size={20} className="text-muted-foreground" />
      </div>
    </div>
  );
}

export default FarmInfo;