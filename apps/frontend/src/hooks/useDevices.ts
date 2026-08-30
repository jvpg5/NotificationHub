import { useQuery } from '@tanstack/react-query';
import { listDevices } from '../services/api';

export function useDevices() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['devices'],
    queryFn: listDevices,
  });

  return { data, isLoading, isError, error };
}