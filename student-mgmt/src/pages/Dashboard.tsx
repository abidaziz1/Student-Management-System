import { Link } from 'react-router-dom';
import {
  Users, UserCheck, BookOpen, ClipboardList,
  ArrowRight, TrendingUp, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useDashboardStats } from '../hooks/useDashboardStats';

// ─── Colour palette ───────────────────────────────────────────────────────────
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

const STATUS_BAR_COLORS: Record<string, string> = {
  Active: '#22c55e',
  Inactive: '#94a3b8',
  Graduated: '#3b82f6',
  Suspended: '#ef4444',
};

// ─── Skeleton helpers ─────────────────────────────────────────────────────────
function SkeletonBox({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className ?? ''}`} style={style} />;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | null;
  icon: React.ElementType;
  accent: string;
  iconBg: string;
  isLoading: boolean;
}

function StatCard({ label, value, icon: Icon, accent, iconBg, isLoading }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${accent}`} />
        </div>
      </div>
      {isLoading
        ? <SkeletonBox className="h-9 w-20" />
        : <p className={`text-3xl font-bold ${value === null ? 'text-gray-300' : 'text-gray-900'}`}>
            {value ?? '—'}
          </p>}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, linkTo, linkLabel }: { title: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <Link
        to={linkTo}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
      >
        {linkLabel}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

const STUDENT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  graduated: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data, isLoading, isError, error } = useDashboardStats();

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Overview of your university system.</p>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error instanceof Error ? error.message : 'Failed to load dashboard data. Check your Supabase connection.'}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={data?.totalStudents ?? null} icon={Users}
          accent="text-blue-500" iconBg="bg-blue-50" isLoading={isLoading} />
        <StatCard label="Active Students" value={data?.activeStudents ?? null} icon={UserCheck}
          accent="text-green-500" iconBg="bg-green-50" isLoading={isLoading} />
        <StatCard label="Total Courses" value={data?.totalCourses ?? null} icon={BookOpen}
          accent="text-purple-500" iconBg="bg-purple-50" isLoading={isLoading} />
        <StatCard label="Total Enrollments" value={data?.totalEnrollments ?? null} icon={ClipboardList}
          accent="text-amber-500" iconBg="bg-amber-50" isLoading={isLoading} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart — Students by status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Students by Status</h2>
          </div>
          {isLoading ? (
            <div className="h-52 flex items-end gap-4 px-4 pb-2">
              {['h-20', 'h-32', 'h-16', 'h-10'].map((h, i) => (
                <div key={i} className={`flex-1 ${h} bg-gray-200 rounded-t animate-pulse`} />
              ))}
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.studentsByStatus ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                    cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(data?.studentsByStatus ?? []).map(entry => (
                      <Cell key={entry.status} fill={STATUS_BAR_COLORS[entry.status] ?? '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie chart — Courses by department */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Courses by Department</h2>
          </div>
          {isLoading ? (
            <div className="h-52 flex items-center justify-center">
              <SkeletonBox className="w-36 h-36 rounded-full" />
            </div>
          ) : (data?.coursesByDepartment?.length ?? 0) === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">
              No department data yet.
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.coursesByDepartment ?? []}
                    dataKey="count"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {(data?.coursesByDepartment ?? []).map((_, i) => (
                      <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Students */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <SectionHeader title="Recent Students" linkTo="/students" linkLabel="View all" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100">
                  {['Name', 'ID', 'Status', 'Enrolled'].map(col => (
                    <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {[60, 40, 50, 55].map((w, j) => (
                        <td key={j} className="px-4 py-3">
                          <SkeletonBox className="h-3.5" style={{ width: `${w}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                  : (data?.recentStudents ?? []).length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">
                        No students yet.
                      </td>
                    </tr>
                  )
                  : (data?.recentStudents ?? []).map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">
                        {student.student_id}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STUDENT_STATUS_COLORS[student.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(student.enrollment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <SectionHeader title="Recent Enrollments" linkTo="/enrollments" linkLabel="View all" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100">
                  {['Student', 'Course', 'Term', 'Status'].map(col => (
                    <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {[55, 65, 40, 45].map((w, j) => (
                        <td key={j} className="px-4 py-3">
                          <SkeletonBox className="h-3.5" style={{ width: `${w}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                  : (data?.recentEnrollments ?? []).length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">
                        No enrollments yet.
                      </td>
                    </tr>
                  )
                  : (data?.recentEnrollments ?? []).map(enrollment => (
                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {enrollment.students
                          ? `${enrollment.students.first_name} ${enrollment.students.last_name}`
                          : <span className="text-gray-400 italic text-xs">Unknown</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">
                        {enrollment.courses?.title ?? <span className="text-gray-400 italic text-xs">Unknown</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap capitalize">
                        {enrollment.semester} {enrollment.year}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          { enrolled: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700',
                            dropped: 'bg-gray-100 text-gray-500', failed: 'bg-red-100 text-red-700' }[enrollment.status] ?? 'bg-gray-100 text-gray-600'
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
