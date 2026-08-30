import type { NotificationResponse } from 'shared-types';
import { Severity, NotificationStatus } from 'shared-types';

interface NotificationCardProps {
  notification: NotificationResponse;
}

const severityClasses: Record<Severity, string> = {
  [Severity.CRITICAL]: 'bg-severity-critical/10 text-severity-critical',
  [Severity.WARNING]: 'bg-severity-warning/10 text-severity-warning',
  [Severity.INFO]: 'bg-severity-info/10 text-severity-info',
};

const statusClasses: Record<NotificationStatus, string> = {
  [NotificationStatus.SENT]: 'bg-status-sent/10 text-status-sent',
  [NotificationStatus.FAILED]: 'bg-status-failed/10 text-status-failed',
  [NotificationStatus.PENDING]: 'bg-status-pending/10 text-status-pending',
};

const badgeBase =
  'inline-flex items-center rounded-badge px-2 py-0.5 text-[11px] font-medium';

function NotificationCard({ notification }: NotificationCardProps) {
  return (
    <div className="py-3 first:pt-0 last:pb-0 border-b border-border last:border-b-0">
      <p className="text-sm text-card-foreground">{notification.message}</p>
      <div className="flex items-center gap-2 mt-1.5">
        <span
          className={`${badgeBase} ${severityClasses[notification.severity]}`}
        >
          {notification.severity}
        </span>
        <span
          className={`${badgeBase} ${statusClasses[notification.status]}`}
        >
          {notification.status}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(notification.createdAt).toLocaleString()}
        </span>
      </div>
      {notification.sentAt && (
        <div className="text-[11px] text-muted-foreground mt-1">
          Sent {new Date(notification.sentAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default NotificationCard;