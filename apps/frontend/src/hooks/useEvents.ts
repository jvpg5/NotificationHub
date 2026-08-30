import { useQuery } from '@tanstack/react-query';
import { listEvents } from '../services/api';
import type { EventType } from 'shared-types';

export function useEvents(params?: {
  limit?: number;
  offset?: number;
  type?: EventType;
}) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events', params],
    queryFn: () => listEvents(params),
  });

  return { data, isLoading, isError, error };
}