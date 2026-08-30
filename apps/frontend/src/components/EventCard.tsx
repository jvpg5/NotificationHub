import type { EventResponse } from 'shared-types';

interface EventCardProps {
  event: EventResponse;
}

function EventCard({ event }: EventCardProps) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0 border-b border-border last:border-b-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-card-foreground truncate">
          {event.type}
        </span>
        <span className="text-xs text-muted-foreground">
          {event.value !== null ? `${event.value} ${event.unit}` : (event.textValue ?? '—')}
        </span>
      </div>
      <span className="text-xs text-muted-foreground shrink-0 ml-2">
        {new Date(event.timestamp).toLocaleString()}
      </span>
    </div>
  );
}

export default EventCard;