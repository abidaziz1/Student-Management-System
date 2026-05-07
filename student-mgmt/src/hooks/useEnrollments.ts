import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Enrollment, EnrollmentWithDetails, EnrollmentWithCourse } from '../types';

const ENROLLMENTS_KEY = ['enrollments'];

export type EnrollmentInput = Omit<Enrollment, 'id' | 'enrolled_at'>;

export function useEnrollments() {
  return useQuery({
    queryKey: ENROLLMENTS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, students(first_name, last_name, student_id), courses(title, course_code)')
        .order('enrolled_at', { ascending: false });
      if (error) throw error;
      return data as EnrollmentWithDetails[];
    },
  });
}

export function useStudentEnrollments(studentId: string) {
  return useQuery({
    queryKey: [...ENROLLMENTS_KEY, 'student', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, courses(title, course_code, credits)')
        .eq('student_id', studentId)
        .order('year', { ascending: false });
      if (error) throw error;
      return data as EnrollmentWithCourse[];
    },
    enabled: !!studentId,
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EnrollmentInput) => {
      // Guard against duplicate: same student + course + semester + year
      const { data: existing, error: checkErr } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', input.student_id)
        .eq('course_id', input.course_id)
        .eq('semester', input.semester)
        .eq('year', input.year)
        .maybeSingle();

      if (checkErr) throw checkErr;
      if (existing) {
        throw new Error(
          'This student is already enrolled in this course for the selected semester and year.'
        );
      }

      const { data, error } = await supabase
        .from('enrollments')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
    },
  });
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: EnrollmentInput & { id: string }) => {
      const { data, error } = await supabase
        .from('enrollments')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
    },
  });
}

export function useDeleteEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('enrollments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
    },
  });
}
