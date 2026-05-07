import { useState, useMemo } from 'react';
import { Plus, Search, ChevronDown, Pencil, Trash2, ClipboardList, AlertCircle } from 'lucide-react';
import {
  useEnrollments,
  useCreateEnrollment,
  useUpdateEnrollment,
  useDeleteEnrollment,
  type EnrollmentInput,
} from '../hooks/useEnrollments';
import { useStudents } from '../hooks/useStudents';
import { useCourses } from '../hooks/useCourses';
import { useToast } from '../components/ui/Toast';
import EnrollmentForm from '../components/enrollments/EnrollmentForm';
import FormModal from '../components/ui/FormModal';
import DeleteConfirmDialog from '../components/ui/DeleteConfirmDialog';
import type { EnrollmentWithDetails } from '../types';

// ─── Grade badge ─────────────────────────────────────────────────────────────
const GRADE_STYLES: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  'A-': 'bg-green-100 text-green-700',
  'B+': 'bg-blue-100 text-blue-700',
  B: 'bg-blue-100 text-blue-700',
  'B-': 'bg-blue-100 text-blue-700',
  'C+': 'bg-yellow-100 text-yellow-700',
  C: 'bg-yellow-100 text-yellow-700',
  'C-': 'bg-yellow-100 text-yellow-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-red-100 text-red-700',
  W: 'bg-gray-100 text-gray-500',
  IP: 'bg-purple-100 text-purple-700',
};

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return <span className="text-gray-300 text-sm">—</span>;
  const cls = GRADE_STYLES[grade] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {grade}
    </span>
  );
}

const STATUS_STYLES: Record<EnrollmentWithDetails['status'], string> = {
  enrolled: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  dropped: 'bg-gray-100 text-gray-500',
  failed: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: EnrollmentWithDetails['status'] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${55 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Filters ─────────────────────────────────────────────────────────────────
const SEMESTER_OPTIONS = [
  { value: '', label: 'All Semesters' },
  { value: 'fall', label: 'Fall' },
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'failed', label: 'Failed' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
  { value: '', label: 'All Years' },
  ...Array.from({ length: 6 }, (_, i) => {
    const y = String(currentYear - i);
    return { value: y, label: y };
  }),
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Enrollments() {
  const { data: enrollments = [], isLoading, isError, error } = useEnrollments();
  const { data: students = [] } = useStudents();
  const { data: coursesWithDept = [] } = useCourses();
  const createEnrollment = useCreateEnrollment();
  const updateEnrollment = useUpdateEnrollment();
  const deleteEnrollment = useDeleteEnrollment();
  const { showToast } = useToast();

  const courses = coursesWithDept; // CourseWithDepartment is assignable to Course for the form

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<EnrollmentWithDetails | undefined>();
  const [pendingDelete, setPendingDelete] = useState<EnrollmentWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return enrollments.filter(e => {
      const studentName = e.students
        ? `${e.students.first_name} ${e.students.last_name}`.toLowerCase()
        : '';
      const studentId = e.students?.student_id?.toLowerCase() ?? '';
      const courseTitle = e.courses?.title?.toLowerCase() ?? '';
      const courseCode = e.courses?.course_code?.toLowerCase() ?? '';
      const matchSearch =
        !q ||
        studentName.includes(q) ||
        studentId.includes(q) ||
        courseTitle.includes(q) ||
        courseCode.includes(q);
      const matchSem = !semFilter || e.semester === semFilter;
      const matchYear = !yearFilter || String(e.year) === yearFilter;
      const matchStatus = !statusFilter || e.status === statusFilter;
      return matchSearch && matchSem && matchYear && matchStatus;
    });
  }, [enrollments, search, semFilter, yearFilter, statusFilter]);

  const openCreate = () => { setEditingEnrollment(undefined); setModalOpen(true); };
  const openEdit = (e: EnrollmentWithDetails) => { setEditingEnrollment(e); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingEnrollment(undefined); };

  const handleSubmit = async (data: EnrollmentInput) => {
    try {
      if (editingEnrollment) {
        await updateEnrollment.mutateAsync({ id: editingEnrollment.id, ...data });
        showToast('Enrollment updated.', 'success');
      } else {
        await createEnrollment.mutateAsync(data);
        showToast('Enrollment created.', 'success');
      }
      closeModal();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteEnrollment.mutateAsync(pendingDelete.id);
      showToast('Enrollment deleted.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete.', 'error');
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const isSubmitting = createEnrollment.isPending || updateEnrollment.isPending;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-gray-500 mt-1">
            {isLoading ? 'Loading…' : `${enrollments.length} enrollment${enrollments.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Enrollment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student or course…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        {[
          { value: semFilter, set: setSemFilter, options: SEMESTER_OPTIONS, width: 'w-36' },
          { value: yearFilter, set: setYearFilter, options: YEAR_OPTIONS, width: 'w-32' },
          { value: statusFilter, set: setStatusFilter, options: STATUS_OPTIONS, width: 'w-36' },
        ].map((f, i) => (
          <div key={i} className="relative">
            <select
              value={f.value}
              onChange={e => f.set(e.target.value)}
              className={`appearance-none ${f.width} pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition`}
            >
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 px-4 py-3 mb-5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error instanceof Error ? error.message : 'Failed to load enrollments.'}
        </div>
      )}

      {/* Result count */}
      {!isLoading && (search || semFilter || yearFilter || statusFilter) && (
        <p className="text-sm text-gray-500 mb-3">
          Showing {filtered.length} of {enrollments.length} enrollment{enrollments.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              {['Student', 'Student ID', 'Course', 'Semester / Year', 'Grade', 'Status', 'Enrolled', 'Actions'].map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : filtered.length === 0
              ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <ClipboardList className="w-7 h-7 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">No enrollments found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {search || semFilter || yearFilter || statusFilter
                            ? 'Try adjusting your filters.'
                            : 'Add your first enrollment to get started.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )
              : filtered.map(enrollment => (
                <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {enrollment.students
                      ? `${enrollment.students.first_name} ${enrollment.students.last_name}`
                      : <span className="text-gray-400 italic">Unknown</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">
                    {enrollment.students?.student_id ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 max-w-[200px]">
                    {enrollment.courses ? (
                      <span>
                        <span className="font-mono text-xs text-blue-600 mr-1.5">{enrollment.courses.course_code}</span>
                        <span className="truncate">{enrollment.courses.title}</span>
                      </span>
                    ) : <span className="text-gray-400 italic">Unknown</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap capitalize">
                    {enrollment.semester} {enrollment.year}
                  </td>
                  <td className="px-4 py-3">
                    <GradeBadge grade={enrollment.grade} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={enrollment.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(enrollment)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit enrollment"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPendingDelete(enrollment)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete enrollment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingEnrollment ? 'Edit Enrollment' : 'Add Enrollment'}
        formId="enrollment-form"
        isSubmitting={isSubmitting}
        submitLabel={editingEnrollment ? 'Save Changes' : 'Create Enrollment'}
      >
        <EnrollmentForm
          key={editingEnrollment?.id ?? 'new'}
          enrollment={editingEnrollment}
          students={students}
          courses={courses}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </FormModal>

      {/* Delete confirm */}
      {pendingDelete && (
        <DeleteConfirmDialog
          title="Delete Enrollment"
          description={
            <>
              Remove{' '}
              <strong>
                {pendingDelete.students
                  ? `${pendingDelete.students.first_name} ${pendingDelete.students.last_name}`
                  : 'this student'}
              </strong>{' '}
              from{' '}
              <strong>{pendingDelete.courses?.title ?? 'this course'}</strong>?
              This cannot be undone.
            </>
          }
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
