import { useQuery } from '@tanstack/react-query';
import { getFarm } from '../services/api';

export function useFarm() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['farm'],
    queryFn: getFarm,
  });

  return { data, isLoading, isError, error };
}