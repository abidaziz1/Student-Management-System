import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Course, Department, CourseWithDepartment } from '../types';

const COURSES_KEY = ['courses'];
const DEPTS_KEY = ['departments'];

export type CourseInput = Omit<Course, 'id'>;

export function useCourses() {
  return useQuery({
    queryKey: COURSES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, departments(name, code)')
        .order('course_code');
      if (error) throw error;
      return data as CourseWithDepartment[];
    },
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: DEPTS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Department[];
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CourseInput) => {
      const { data, error } = await supabase
        .from('courses')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: CourseInput & { id: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY });
    },
  });
}
