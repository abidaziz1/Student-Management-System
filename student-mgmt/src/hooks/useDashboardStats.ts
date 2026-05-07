import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Student, EnrollmentWithDetails } from '../types';

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  studentsByStatus: { status: string; count: number }[];
  coursesByDepartment: { department: string; count: number }[];
  recentStudents: Student[];
  recentEnrollments: EnrollmentWithDetails[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardStats> => {
      const [
        { data: studentsData, error: e1 },
        { count: coursesCount, error: e2 },
        { count: enrollmentsCount, error: e3 },
        { data: recentStudents, error: e4 },
        { data: recentEnrollments, error: e5 },
        { data: coursesWithDept, error: e6 },
      ] = await Promise.all([
        supabase.from('students').select('status'),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('enrollments')
          .select('*, students(first_name, last_name, student_id), courses(title, course_code)')
          .order('enrolled_at', { ascending: false })
          .limit(5),
        supabase.from('courses').select('*, departments(name)').order('course_code'),
      ]);

      if (e1) throw e1;
      if (e2) throw e2;
      if (e3) throw e3;
      if (e4) throw e4;
      if (e5) throw e5;
      if (e6) throw e6;

      const totalStudents = studentsData?.length ?? 0;
      const activeStudents = studentsData?.filter(s => s.status === 'active').length ?? 0;

      const studentsByStatus = (['active', 'inactive', 'graduated', 'suspended'] as const).map(
        status => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count: studentsData?.filter(s => s.status === status).length ?? 0,
        })
      );

      const deptMap = new Map<string, number>();
      (coursesWithDept ?? []).forEach(c => {
        const deptName = (c as { departments?: { name: string } | null }).departments?.name ?? 'Unassigned';
        deptMap.set(deptName, (deptMap.get(deptName) ?? 0) + 1);
      });
      const coursesByDepartment = Array.from(deptMap.entries()).map(([department, count]) => ({
        department,
        count,
      }));

      return {
        totalStudents,
        activeStudents,
        totalCourses: coursesCount ?? 0,
        totalEnrollments: enrollmentsCount ?? 0,
        studentsByStatus,
        coursesByDepartment,
        recentStudents: (recentStudents ?? []) as Student[],
        recentEnrollments: (recentEnrollments ?? []) as EnrollmentWithDetails[],
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}
