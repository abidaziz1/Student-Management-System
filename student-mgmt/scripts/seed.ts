/**
 * Seed script — inserts realistic Bangladeshi university data into Supabase.
 *
 * Run with:  npm run seed
 * (requires .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
 *
 * Idempotent: checks for existing rows before inserting, safe to run multiple times.
 */

import { createClient } from '@supabase/supabase-js';

// ── Supabase client (reads env vars injected by --env-file flag) ────────────
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌  Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Helpers ─────────────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

// ── 1. Departments ───────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { name: 'Computer Science & Engineering', code: 'CSE' },
  { name: 'Electrical & Electronic Engineering', code: 'EEE' },
  { name: 'Business Administration', code: 'BBA' },
  { name: 'English Literature', code: 'ENG' },
  { name: 'Mathematics', code: 'MATH' },
  { name: 'Physics', code: 'PHY' },
];

// ── 2. Courses (keyed by department code, inserted after dept IDs are known) ─
const COURSES_BY_DEPT: Record<string, { course_code: string; title: string; credits: number; description: string }[]> = {
  CSE: [
    {
      course_code: 'CSE101',
      title: 'Introduction to Programming',
      credits: 3,
      description: 'Fundamentals of programming using Python: variables, control flow, functions, and basic data structures.',
    },
    {
      course_code: 'CSE201',
      title: 'Data Structures & Algorithms',
      credits: 3,
      description: 'Arrays, linked lists, stacks, queues, trees, graphs, and algorithmic complexity analysis.',
    },
  ],
  EEE: [
    {
      course_code: 'EEE101',
      title: 'Circuit Theory',
      credits: 3,
      description: 'Ohm\'s law, Kirchhoff\'s laws, AC/DC circuit analysis, and network theorems.',
    },
    {
      course_code: 'EEE201',
      title: 'Digital Electronics',
      credits: 3,
      description: 'Boolean algebra, logic gates, combinational and sequential circuits, and microcontroller basics.',
    },
  ],
  BBA: [
    {
      course_code: 'BBA101',
      title: 'Principles of Management',
      credits: 3,
      description: 'Foundations of organizational management: planning, organising, leading, and controlling.',
    },
    {
      course_code: 'BBA201',
      title: 'Financial Accounting',
      credits: 3,
      description: 'Double-entry bookkeeping, trial balance, income statements, balance sheets, and financial analysis.',
    },
  ],
  ENG: [
    {
      course_code: 'ENG101',
      title: 'Fundamentals of English',
      credits: 2,
      description: 'Grammar, academic writing, comprehension, and communication skills for university study.',
    },
    {
      course_code: 'ENG201',
      title: 'World Literature',
      credits: 2,
      description: 'Survey of major literary movements and texts from South Asia, Europe, and the Americas.',
    },
  ],
  MATH: [
    {
      course_code: 'MATH101',
      title: 'Calculus I',
      credits: 3,
      description: 'Limits, derivatives, integrals, and the fundamental theorem of calculus.',
    },
    {
      course_code: 'MATH201',
      title: 'Linear Algebra',
      credits: 3,
      description: 'Vectors, matrices, determinants, eigenvalues, and systems of linear equations.',
    },
  ],
  PHY: [
    {
      course_code: 'PHY101',
      title: 'Mechanics',
      credits: 3,
      description: 'Kinematics, Newton\'s laws, work and energy, momentum, and rotational motion.',
    },
    {
      course_code: 'PHY201',
      title: 'Electromagnetism',
      credits: 3,
      description: 'Coulomb\'s law, electric fields, magnetic fields, Faraday\'s law, and Maxwell\'s equations.',
    },
  ],
};

// ── 3. Students ──────────────────────────────────────────────────────────────
const CITIES = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi',
  'Khulna', 'Comilla', 'Mymensingh', 'Barisal',
];

const STREETS = [
  'House 12, Road 5, Dhanmondi',
  'Flat 3B, Mirpur-10',
  'House 7, Block C, Banani',
  'Road 14, Gulshan-2',
  'House 22, Sector 6, Uttara',
  'Flat 5A, Agrabad',
  'House 9, Nasirabad',
  'Shahjalal Road, Zindabazar',
  'House 3, Upashahar',
  'Court Road, Ghoramara',
];

const STUDENTS_DATA = [
  // Male students
  { first_name: 'Md. Rafiqul', last_name: 'Islam',   gender: 'male',   dob: '2001-03-14', phone: '+880 1711 234567' },
  { first_name: 'Abdullah Al', last_name: 'Mamun',    gender: 'male',   dob: '2000-07-22', phone: '+880 1912 345678' },
  { first_name: 'Tanvir',      last_name: 'Ahmed',    gender: 'male',   dob: '2002-01-09', phone: '+880 1713 456789' },
  { first_name: 'Mehedi',      last_name: 'Hassan',   gender: 'male',   dob: '2001-11-30', phone: '+880 1914 567890' },
  { first_name: 'Fahim',       last_name: 'Rahman',   gender: 'male',   dob: '2003-05-17', phone: '+880 1715 678901' },
  { first_name: 'Sakib',       last_name: 'Hossain',  gender: 'male',   dob: '2000-09-04', phone: '+880 1916 789012' },
  { first_name: 'Nayeem',      last_name: 'Hasan',    gender: 'male',   dob: '2002-08-25', phone: '+880 1717 890123' },
  { first_name: 'Arif',        last_name: 'Hossain',  gender: 'male',   dob: '2001-12-11', phone: '+880 1918 901234' },
  { first_name: 'Shakil',      last_name: 'Ahmed',    gender: 'male',   dob: '2003-02-28', phone: '+880 1719 012345' },
  { first_name: 'Imran',       last_name: 'Khan',     gender: 'male',   dob: '2000-06-16', phone: '+880 1820 123456' },
  // Female students
  { first_name: 'Tasnim',      last_name: 'Akter',    gender: 'female', dob: '2001-04-03', phone: '+880 1721 234567' },
  { first_name: 'Farida',      last_name: 'Begum',    gender: 'female', dob: '2002-10-19', phone: '+880 1922 345678' },
  { first_name: 'Sadia',       last_name: 'Islam',    gender: 'female', dob: '2000-08-07', phone: '+880 1723 456789' },
  { first_name: 'Nusrat',      last_name: 'Jahan',    gender: 'female', dob: '2003-01-23', phone: '+880 1924 567890' },
  { first_name: 'Mithila',     last_name: 'Rahman',   gender: 'female', dob: '2001-06-15', phone: '+880 1725 678901' },
  { first_name: 'Sumaiya',     last_name: 'Khan',     gender: 'female', dob: '2002-03-31', phone: '+880 1926 789012' },
  { first_name: 'Riya',        last_name: 'Chowdhury', gender: 'female', dob: '2000-11-08', phone: '+880 1727 890123' },
  { first_name: 'Anika',       last_name: 'Sultana',  gender: 'female', dob: '2003-07-20', phone: '+880 1928 901234' },
  { first_name: 'Lamia',       last_name: 'Hossain',  gender: 'female', dob: '2001-09-12', phone: '+880 1729 012345' },
  { first_name: 'Fatema',      last_name: 'Akter',    gender: 'female', dob: '2002-05-05', phone: '+880 1830 123456' },
] as const;

const STATUSES = ['active', 'active', 'active', 'active', 'inactive', 'graduated', 'suspended'] as const;

// ── 4. Enrollment plan ───────────────────────────────────────────────────────
// Each row: [studentIndex, courseCode, semester, year, grade, status]
const GRADE_POOL = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F', null, null] as const;
type Grade = typeof GRADE_POOL[number];
type Semester = 'fall' | 'spring' | 'summer';
type EnrollStatus = 'enrolled' | 'completed' | 'dropped' | 'failed';

function gradeToStatus(grade: Grade, year: number): EnrollStatus {
  if (year === 2025) return 'enrolled';
  if (grade === null) return 'dropped';
  if (grade === 'F') return 'failed';
  return 'completed';
}

// Build a varied set of enrollments across years and semesters
function buildEnrollments(studentIds: string[], courseMap: Record<string, string>) {
  const allCourseCodes = Object.keys(courseMap);
  const rows: {
    student_id: string;
    course_id: string;
    semester: Semester;
    year: number;
    grade: string | null;
    status: EnrollStatus;
  }[] = [];

  const seen = new Set<string>();

  // Each student gets 1-3 enrollments spread across years
  studentIds.forEach((studentId, i) => {
    const count = 1 + (i % 3); // 1, 2, or 3 enrollments per student
    const coursesToEnroll = [...allCourseCodes].sort(() => Math.random() - 0.5).slice(0, count);
    const semesters: Semester[] = ['fall', 'spring', 'summer'];
    const years = [2022, 2023, 2024, 2025];

    coursesToEnroll.forEach((code, j) => {
      const courseId = courseMap[code];
      if (!courseId) return;
      const year = years[(i + j) % years.length];
      const semester = semesters[(i + j) % semesters.length];
      const key = `${studentId}-${courseId}-${semester}-${year}`;
      if (seen.has(key)) return;
      seen.add(key);

      const grade = year === 2025 ? null : (pick(GRADE_POOL) as Grade);
      rows.push({
        student_id: studentId,
        course_id: courseId,
        semester,
        year,
        grade: grade ?? null,
        status: gradeToStatus(grade, year),
      });
    });
  });

  return rows;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱  Starting seed...\n');

  // ── Departments ──────────────────────────────────────────────────────────
  const { count: existingDepts } = await supabase
    .from('departments')
    .select('*', { count: 'exact', head: true });

  let deptRows: { id: string; code: string }[] = [];

  if (existingDepts && existingDepts > 0) {
    console.log(`⚠️   Departments already exist (${existingDepts}) — skipping insert`);
    const { data } = await supabase.from('departments').select('id, code');
    deptRows = (data ?? []) as { id: string; code: string }[];
  } else {
    const { data, error } = await supabase
      .from('departments')
      .insert(DEPARTMENTS)
      .select('id, code');
    if (error) throw new Error(`Departments: ${error.message}`);
    deptRows = (data ?? []) as { id: string; code: string }[];
    console.log(`✅  Inserted ${deptRows.length} departments`);
  }

  const deptIdByCode: Record<string, string> = {};
  deptRows.forEach(d => { deptIdByCode[d.code] = d.id; });

  // ── Courses ──────────────────────────────────────────────────────────────
  const { count: existingCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });

  let courseMap: Record<string, string> = {};

  if (existingCourses && existingCourses > 0) {
    console.log(`⚠️   Courses already exist (${existingCourses}) — skipping insert`);
    const { data } = await supabase.from('courses').select('id, course_code');
    (data ?? []).forEach((c: { id: string; course_code: string }) => {
      courseMap[c.course_code] = c.id;
    });
  } else {
    const courseRows = Object.entries(COURSES_BY_DEPT).flatMap(([deptCode, courses]) =>
      courses.map(c => ({ ...c, department_id: deptIdByCode[deptCode] ?? null }))
    );
    const { data, error } = await supabase
      .from('courses')
      .insert(courseRows)
      .select('id, course_code');
    if (error) throw new Error(`Courses: ${error.message}`);
    (data ?? []).forEach((c: { id: string; course_code: string }) => {
      courseMap[c.course_code] = c.id;
    });
    console.log(`✅  Inserted ${data?.length ?? 0} courses`);
  }

  // ── Students ─────────────────────────────────────────────────────────────
  const { count: existingStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });

  let studentIds: string[] = [];

  if (existingStudents && existingStudents > 0) {
    console.log(`⚠️   Students already exist (${existingStudents}) — skipping insert`);
    const { data } = await supabase.from('students').select('id').order('created_at');
    studentIds = (data ?? []).map((s: { id: string }) => s.id);
  } else {
    const enrollmentBase = new Date('2022-01-15');
    const studentRows = STUDENTS_DATA.map((s, i) => {
      const city = CITIES[i % CITIES.length];
      const street = STREETS[i % STREETS.length];
      const enDate = new Date(enrollmentBase);
      enDate.setMonth(enDate.getMonth() + i * 2);
      return {
        student_id: `BD2024${String(i + 1).padStart(3, '0')}`,
        first_name: s.first_name,
        last_name: s.last_name,
        email: `${s.first_name.toLowerCase().replace(/[^a-z]/g, '')}.${s.last_name.toLowerCase()}${i + 1}@uniadmin.edu.bd`,
        phone: s.phone,
        date_of_birth: s.dob,
        gender: s.gender as 'male' | 'female',
        address: `${street}, ${city}`,
        enrollment_date: enDate.toISOString().split('T')[0],
        status: STATUSES[i % STATUSES.length] as 'active' | 'inactive' | 'graduated' | 'suspended',
      };
    });

    const { data, error } = await supabase
      .from('students')
      .insert(studentRows)
      .select('id');
    if (error) throw new Error(`Students: ${error.message}`);
    studentIds = (data ?? []).map((s: { id: string }) => s.id);
    console.log(`✅  Inserted ${studentIds.length} students`);
  }

  // ── Enrollments ──────────────────────────────────────────────────────────
  const { count: existingEnrollments } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true });

  if (existingEnrollments && existingEnrollments > 0) {
    console.log(`⚠️   Enrollments already exist (${existingEnrollments}) — skipping insert`);
  } else {
    const enrollmentRows = buildEnrollments(studentIds, courseMap);
    const { data, error } = await supabase
      .from('enrollments')
      .insert(enrollmentRows)
      .select('id');
    if (error) throw new Error(`Enrollments: ${error.message}`);
    console.log(`✅  Inserted ${data?.length ?? 0} enrollments`);
  }

  console.log('\n🎉  Seed complete! Open http://localhost:5173 to see the data.\n');
}

seed().catch(err => {
  console.error('\n❌  Seed failed:', err.message ?? err);
  process.exit(1);
});
