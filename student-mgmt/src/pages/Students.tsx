import { useState, useMemo } from 'react';
import { UserPlus, Search, ChevronDown, AlertCircle } from 'lucide-react';
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  type StudentInput,
} from '../hooks/useStudents';
import { useToast } from '../components/ui/Toast';
import StudentTable from '../components/students/StudentTable';
import StudentModal from '../components/students/StudentModal';
import type { Student } from '../types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'suspended', label: 'Suspended' },
];

export default function Students() {
  const { data: students = [], isLoading, isError, error } = useStudents();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter(s => {
      const matchesSearch =
        !q ||
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  const openCreate = () => {
    setEditingStudent(undefined);
    setModalOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingStudent(undefined);
  };

  const handleSubmit = async (data: StudentInput) => {
    try {
      if (editingStudent) {
        await updateStudent.mutateAsync({ id: editingStudent.id, ...data });
        showToast('Student updated successfully.', 'success');
      } else {
        await createStudent.mutateAsync(data);
        showToast('Student created successfully.', 'success');
      }
      closeModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      showToast(message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent.mutateAsync(id);
      showToast('Student deleted.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete student.';
      showToast(message, 'error');
    }
  };

  const isSubmitting = createStudent.isPending || updateStudent.isPending;

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">
            {isLoading
              ? 'Loading…'
              : `${students.length} student${students.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email or student ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none w-full sm:w-44 pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-3 px-4 py-3 mb-5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            {error instanceof Error ? error.message : 'Failed to load students. Check your Supabase connection.'}
          </span>
        </div>
      )}

      {/* Results count when filtering */}
      {!isLoading && (search || statusFilter) && (
        <p className="text-sm text-gray-500 mb-3">
          Showing {filtered.length} of {students.length} student{students.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Table */}
      <StudentTable
        students={filtered}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <StudentModal
        isOpen={modalOpen}
        onClose={closeModal}
        student={editingStudent}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
