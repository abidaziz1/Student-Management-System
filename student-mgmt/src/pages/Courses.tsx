import { useState, useMemo } from 'react';
import { Plus, Search, ChevronDown, Pencil, Trash2, BookOpen, AlertCircle, Star } from 'lucide-react';
import {
  useCourses,
  useDepartments,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  type CourseInput,
} from '../hooks/useCourses';
import { useToast } from '../components/ui/Toast';
import CourseForm from '../components/courses/CourseForm';
import FormModal from '../components/ui/FormModal';
import DeleteConfirmDialog from '../components/ui/DeleteConfirmDialog';
import type { CourseWithDepartment } from '../types';

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  course: CourseWithDepartment;
  onEdit: (c: CourseWithDepartment) => void;
  onDelete: (c: CourseWithDepartment) => void;
}

function CourseCard({ course, onEdit, onDelete }: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold font-mono tracking-wide">
          {course.course_code}
        </span>
        <span className="flex items-center gap-1 text-xs text-amber-600 font-medium flex-shrink-0">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {course.credits} cr
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">{course.title}</h3>
        {course.departments && (
          <p className="text-xs text-gray-500 mt-0.5">
            {course.departments.name}
            <span className="text-gray-300 mx-1">·</span>
            {course.departments.code}
          </p>
        )}
      </div>

      {course.description && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">
          {course.description}
        </p>
      )}

      <div className="flex items-center justify-end gap-1 pt-1 border-t border-gray-100 mt-auto">
        <button
          onClick={() => onEdit(course)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Edit course"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(course)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete course"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 animate-pulse">
      <div className="h-6 w-20 bg-gray-200 rounded-md" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-100 rounded" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 w-5/6 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Courses() {
  const { data: courses = [], isLoading, isError, error } = useCourses();
  const { data: departments = [] } = useDepartments();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithDepartment | undefined>();
  const [pendingDelete, setPendingDelete] = useState<CourseWithDepartment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return courses.filter(c => {
      const matchSearch =
        !q || c.title.toLowerCase().includes(q) || c.course_code.toLowerCase().includes(q);
      const matchDept = !deptFilter || c.department_id === deptFilter;
      return matchSearch && matchDept;
    });
  }, [courses, search, deptFilter]);

  const openCreate = () => { setEditingCourse(undefined); setModalOpen(true); };
  const openEdit = (c: CourseWithDepartment) => { setEditingCourse(c); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingCourse(undefined); };

  const handleSubmit = async (data: CourseInput) => {
    try {
      if (editingCourse) {
        await updateCourse.mutateAsync({ id: editingCourse.id, ...data });
        showToast('Course updated successfully.', 'success');
      } else {
        await createCourse.mutateAsync(data);
        showToast('Course created successfully.', 'success');
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
      await deleteCourse.mutateAsync(pendingDelete.id);
      showToast('Course deleted.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete course.', 'error');
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const isSubmitting = createCourse.isPending || updateCourse.isPending;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 mt-1">
            {isLoading ? 'Loading…' : `${courses.length} course${courses.length !== 1 ? 's' : ''} in catalog`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or course code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div className="relative">
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="appearance-none w-full sm:w-52 pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 px-4 py-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error instanceof Error ? error.message : 'Failed to load courses.'}
        </div>
      )}

      {/* Result count */}
      {!isLoading && (search || deptFilter) && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {filtered.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <BookOpen className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No courses found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search || deptFilter ? 'Try adjusting your filters.' : 'Add your first course to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={openEdit}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCourse ? 'Edit Course' : 'Add Course'}
        formId="course-form"
        isSubmitting={isSubmitting}
        submitLabel={editingCourse ? 'Save Changes' : 'Create Course'}
      >
        <CourseForm
          key={editingCourse?.id ?? 'new'}
          course={editingCourse}
          departments={departments}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </FormModal>

      {/* Delete confirm */}
      {pendingDelete && (
        <DeleteConfirmDialog
          title="Delete Course"
          description={<>Are you sure you want to delete <strong>{pendingDelete.title}</strong>? This action cannot be undone.</>}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
