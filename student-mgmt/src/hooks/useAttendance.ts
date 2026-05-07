import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Attendance, AttendanceWithDetails } from '../types';

const ATTENDANCE_KEY = ['attendance'];

export type AttendanceInput = Omit<Attendance, 'id' | 'created_at'>;

export function useAttendance(filters?: { course_id?: string; date?: string }) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select('*, students(first_name, last_name, student_id), courses(title, course_code)')
        .order('date', { ascending: false });

      if (filters?.course_id) query = query.eq('course_id', filters.course_id);
      if (filters?.date) query = query.eq('date', filters.date);

      const { data, error } = await query;
      if (error) throw error;
      return data as AttendanceWithDetails[];
    },
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AttendanceInput) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: AttendanceInput & { id: string }) => {
      const { data, error } = await supabase
        .from('attendance')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('attendance').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}
