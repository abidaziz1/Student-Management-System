export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  address: string | null;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Course {
  id: string;
  course_code: string;
  title: string;
  credits: number;
  department_id: string;
  description: string | null;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  semester: 'fall' | 'spring' | 'summer';
  year: number;
  grade: string | null;
  status: 'enrolled' | 'completed' | 'dropped' | 'failed';
  enrolled_at: string;
}

// Joined query shapes returned by Supabase select with foreign-table embeds
export interface CourseWithDepartment extends Course {
  departments: Pick<Department, 'name' | 'code'> | null;
}

export interface EnrollmentWithDetails extends Enrollment {
  students: Pick<Student, 'first_name' | 'last_name' | 'student_id'> | null;
  courses: Pick<Course, 'title' | 'course_code'> | null;
}

export interface EnrollmentWithCourse extends Enrollment {
  courses: Pick<Course, 'title' | 'course_code'> | null;
}
