import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Faculty, FacultyWithDepartment } from '../types';

const FACULTY_KEY = ['faculty'];

export type FacultyInput = Omit<Faculty, 'id' | 'created_at'>;

export function useFaculty() {
  return useQuery({
    queryKey: FACULTY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faculty')
        .select('*, departments(name, code)')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as FacultyWithDepartment[];
    },
  });
}

export function useCreateFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: FacultyInput) => {
      const { data, error } = await supabase
        .from('faculty')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Faculty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FACULTY_KEY });
    },
  });
}

export function useUpdateFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: FacultyInput & { id: string }) => {
      const { data, error } = await supabase
        .from('faculty')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Faculty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FACULTY_KEY });
    },
  });
}

export function useDeleteFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faculty').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FACULTY_KEY });
    },
  });
}
