import { useQuery } from '@tanstack/react-query';
import { listNotifications } from '../services/api';
import type { NotificationStatus, Severity } from 'shared-types';

export function useNotifications(params?: {
  limit?: number;
  offset?: number;
  status?: NotificationStatus;
  severity?: Severity;
}) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => listNotifications(params),
  });

  return { data, isLoading, isError, error };
}