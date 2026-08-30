import { useState, useMemo } from 'react';
import { useHistory } from '../hooks/useHistory';
import type { HistoryRow } from '../hooks/useHistory';
import SkeletonCard from '../components/SkeletonCard';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import type { EventType, NotificationStatus, Severity } from 'shared-types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

const EVENT_TYPE_OPTIONS: Array<{ label: string; value: EventType | '' }> = [
  { label: 'All Types', value: '' },
  { label: 'Air Temperature', value: 'AIR_TEMPERATURE' as EventType },
  { label: 'Air Humidity', value: 'AIR_HUMIDITY' as EventType },
  { label: 'Soil Moisture', value: 'SOIL_MOISTURE' as EventType },
  { label: 'Water Reservoir Level', value: 'WATER_RESERVOIR_LEVEL' as EventType },
  { label: 'Silo Level', value: 'SILO_LEVEL' as EventType },
  { label: 'Equipment Status', value: 'EQUIPMENT_STATUS' as EventType },
];

const SEVERITY_OPTIONS: Array<{ label: string; value: Severity | '' }> = [
  { label: 'All Severities', value: '' },
  { label: 'CRITICAL', value: 'CRITICAL' as Severity },
  { label: 'WARNING', value: 'WARNING' as Severity },
  { label: 'INFO', value: 'INFO' as Severity },
];

const STATUS_OPTIONS: Array<{ label: string; value: NotificationStatus | '' }> = [
  { label: 'All Statuses', value: '' },
  { label: 'SENT', value: 'SENT' as NotificationStatus },
  { label: 'FAILED', value: 'FAILED' as NotificationStatus },
  { label: 'PENDING', value: 'PENDING' as NotificationStatus },
];

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------

const severityClasses: Record<string, string> = {
  CRITICAL: 'bg-severity-critical/10 text-severity-critical',
  WARNING: 'bg-severity-warning/10 text-severity-warning',
  INFO: 'bg-severity-info/10 text-severity-info',
};

const statusClasses: Record<string, string> = {
  SENT: 'bg-status-sent/10 text-status-sent',
  FAILED: 'bg-status-failed/10 text-status-failed',
  PENDING: 'bg-status-pending/10 text-status-pending',
};

const badgeBase =
  'inline-flex items-center rounded-badge px-2 py-0.5 text-[11px] font-medium';

// ---------------------------------------------------------------------------
// Row helpers
// ---------------------------------------------------------------------------

function formatValue(row: HistoryRow): string {
  if (row.type === 'EQUIPMENT_STATUS') {
    return String(row.value);
  }
  if (typeof row.value === 'number') {
    return row.value.toFixed(1);
  }
  return String(row.value);
}

function formatType(type: string): string {
  return type.replace(/_/g, ' ');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function History() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<EventType | ''>('');
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('');
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | ''>('');

  const offset = (page - 1) * PAGE_SIZE;

  const params = useMemo(
    () => ({
      limit: PAGE_SIZE,
      offset,
      ...(typeFilter ? { type: typeFilter as EventType } : {}),
      ...(severityFilter ? { severity: severityFilter as Severity } : {}),
      ...(statusFilter ? { status: statusFilter as NotificationStatus } : {}),
    }),
    [offset, typeFilter, severityFilter, statusFilter],
  );

  const { rows, total, isLoading, isError } = useHistory(params);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // --- Filter change handler (resets page) ---
  function handleTypeChange(value: string) {
    setTypeFilter(value as EventType | '');
    setPage(1);
  }

  function handleSeverityChange(value: string) {
    setSeverityFilter(value as Severity | '');
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value as NotificationStatus | '');
    setPage(1);
  }

  return (
    <div>
      <h1 className="font-titulo text-lg font-semibold text-card-foreground mb-5">
        History
      </h1>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label htmlFor="filter-type" className="block text-sm font-medium text-card-foreground mb-1">
            Event Type
          </label>
          <select
            id="filter-type"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-severity" className="block text-sm font-medium text-card-foreground mb-1">
            Severity
          </label>
          <select
            id="filter-severity"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={severityFilter}
            onChange={(e) => handleSeverityChange(e.target.value)}
          >
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-status" className="block text-sm font-medium text-card-foreground mb-1">
            Status
          </label>
          <select
            id="filter-status"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table section */}
      {isLoading && <SkeletonCard lines={8} />}
      {isError && <ErrorState />}
      {!isLoading && !isError && rows.length === 0 && (
        <EmptyState
          title="No history records found"
          description="Try adjusting your filters."
        />
      )}
      {!isLoading && !isError && rows.length > 0 && (
        <>
          <div className="bg-card rounded-card border border-border shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 whitespace-nowrap">Event ID</th>
                  <th className="px-4 py-3 whitespace-nowrap">Device</th>
                  <th className="px-4 py-3 whitespace-nowrap">Type</th>
                  <th className="px-4 py-3 whitespace-nowrap">Value</th>
                  <th className="px-4 py-3 whitespace-nowrap">Timestamp</th>
                  <th className="px-4 py-3 whitespace-nowrap">Rule</th>
                  <th className="px-4 py-3 whitespace-nowrap">Severity</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">Sent At</th>
                  <th className="px-4 py-3 whitespace-nowrap">Failure Reason</th>
                  <th className="px-4 py-3 whitespace-nowrap">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr
                    key={row.eventId}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{row.eventId}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.deviceId}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatType(row.type)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatValue(row)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.ruleTriggered ?? '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.severity ? (
                        <span
                          className={`${badgeBase} ${severityClasses[row.severity] ?? ''}`}
                        >
                          {row.severity}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span
                        title={row.message ?? undefined}
                        className="block truncate"
                        style={{ maxWidth: '20rem' }}
                      >
                        {row.message ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.status ? (
                        <span
                          className={`${badgeBase} ${statusClasses[row.status] ?? ''}`}
                        >
                          {row.status}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      {row.sentAt
                        ? new Date(row.sentAt).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      {row.failureReason ?? '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.ruleTriggered === null ? (
                        <span className="text-muted-foreground italic">No alert</span>
                      ) : row.status === 'FAILED' ? (
                        <span className="text-status-failed font-medium">
                          FAILED — {row.failureReason ?? 'unknown reason'}
                        </span>
                      ) : (
                        <span className="text-status-sent font-medium">{row.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={offset + PAGE_SIZE >= total}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default History;