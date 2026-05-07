import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  BookOpen,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useStudentById } from '../hooks/useStudents';
import { useStudentEnrollments } from '../hooks/useEnrollments';
import type { Student, EnrollmentWithCourse } from '../types';

// ─── Status + grade helpers ───────────────────────────────────────────────────
const STUDENT_STATUS_STYLES: Record<Student['status'], string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  graduated: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
};

const ENROLLMENT_STATUS_STYLES: Record<string, string> = {
  enrolled: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  dropped: 'bg-gray-100 text-gray-500',
  failed: 'bg-red-100 text-red-700',
};

const GRADE_STYLES: Record<string, string> = {
  A: 'bg-green-100 text-green-700', 'A-': 'bg-green-100 text-green-700',
  'B+': 'bg-blue-100 text-blue-700', B: 'bg-blue-100 text-blue-700', 'B-': 'bg-blue-100 text-blue-700',
  'C+': 'bg-yellow-100 text-yellow-700', C: 'bg-yellow-100 text-yellow-700', 'C-': 'bg-yellow-100 text-yellow-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-red-100 text-red-700',
  W: 'bg-gray-100 text-gray-500',
  IP: 'bg-purple-100 text-purple-700',
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5">{value ?? <span className="text-gray-300">—</span>}</p>
      </div>
    </div>
  );
}

// ─── Enrollment row ───────────────────────────────────────────────────────────
function EnrollmentRow({ enrollment }: { enrollment: EnrollmentWithCourse }) {
  const grade = enrollment.grade;
  const gradeStyle = grade ? (GRADE_STYLES[grade] ?? 'bg-gray-100 text-gray-600') : null;
  const statusStyle = ENROLLMENT_STATUS_STYLES[enrollment.status] ?? 'bg-gray-100 text-gray-600';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        {enrollment.courses ? (
          <div>
            <span className="inline-block font-mono text-xs text-blue-600 mb-0.5">{enrollment.courses.course_code}</span>
            <p className="text-sm text-gray-900">{enrollment.courses.title}</p>
          </div>
        ) : <span className="text-gray-400 text-sm italic">Unknown course</span>}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 capitalize whitespace-nowrap">
        {enrollment.semester} {enrollment.year}
      </td>
      <td className="px-4 py-3">
        {gradeStyle
          ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${gradeStyle}`}>{grade}</span>
          : <span className="text-gray-300 text-sm">—</span>}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle}`}>
          {enrollment.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        })}
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading: loadingStudent, isError: studentError } = useStudentById(id ?? '');
  const { data: enrollments = [], isLoading: loadingEnrollments } = useStudentEnrollments(id ?? '');

  if (loadingStudent) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (studentError || !student) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Student not found or failed to load.
        </div>
        <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </button>
      </div>
    );
  }

  const fullName = `${student.first_name} ${student.last_name}`;
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();

  return (
    <div className="p-8 max-w-5xl">
      {/* Back link */}
      <button
        onClick={() => navigate('/students')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Profile card ─────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Avatar header */}
            <div className="bg-gradient-to-br from-[#1e2a3b] to-[#2d3f58] px-6 py-8 flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
              <div className="text-center">
                <h1 className="text-white font-bold text-lg">{fullName}</h1>
                <p className="text-slate-400 text-sm font-mono mt-0.5">{student.student_id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STUDENT_STATUS_STYLES[student.status]}`}>
                {student.status}
              </span>
            </div>

            {/* Details */}
            <div className="px-5 py-2">
              <InfoRow icon={Mail} label="Email" value={student.email} />
              <InfoRow icon={Phone} label="Phone" value={student.phone} />
              <InfoRow icon={User} label="Gender" value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : null} />
              <InfoRow icon={Calendar} label="Date of Birth" value={student.date_of_birth
                ? new Date(student.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : null}
              />
              <InfoRow icon={Hash} label="Enrollment Date" value={
                new Date(student.enrollment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              } />
              <InfoRow icon={MapPin} label="Address" value={student.address} />
            </div>
          </div>
        </div>

        {/* ── Enrolled Courses tab ──────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Enrolled Courses</h2>
                {!loadingEnrollments && (
                  <p className="text-xs text-gray-400">
                    {enrollments.length} enrollment{enrollments.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {['Course', 'Term', 'Grade', 'Status', 'Enrolled On'].map(col => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingEnrollments ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        {Array.from({ length: 5 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '70%' }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <BookOpen className="w-8 h-8 text-gray-300" />
                          <p className="text-sm text-gray-400">No enrollments yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    enrollments.map(enrollment => (
                      <EnrollmentRow key={enrollment.id} enrollment={enrollment} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
