import { Cpu } from 'lucide-react';
import { useDevices } from '../hooks/useDevices';
import SkeletonCard from './SkeletonCard';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

function DeviceList() {
  const { data, isLoading, isError } = useDevices();

  if (isLoading) return <SkeletonCard />;
  if (isError) return <ErrorState />;
  if (!data || !data.data || data.data.length === 0)
    return (
      <EmptyState
        title="No devices"
        description="Run the seed script."
      />
    );

  return (
    <div className="bg-card rounded-card border border-border p-5 shadow-sm">
      <div className="flex items-center gap-1.5 mb-3">
        <Cpu size={16} className="text-muted-foreground" />
        <h2 className="font-titulo text-[15px] font-semibold text-card-foreground">
          Devices
        </h2>
      </div>
      <ul className="divide-y divide-border">
        {data.data.map((device) => (
          <li
            key={device.id}
            className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
          >
            <span className="text-sm text-card-foreground">{device.label}</span>
            <span className="inline-flex items-center rounded-badge px-2 py-0.5 text-[11px] font-medium border border-border text-muted-foreground">
              {device.type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DeviceList;