import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent } from '../services/api';
import type { CreateEventDto } from 'shared-types';

export function useCreateEvent() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateEventDto) => createEvent(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}