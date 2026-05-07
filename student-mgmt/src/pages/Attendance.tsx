import { useState } from 'react';
import { CalendarCheck, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { useAttendance, useCreateAttendance, useUpdateAttendance, useDeleteAttendance } from '../hooks/useAttendance';
import type { AttendanceWithDetails } from '../types';
import type { AttendanceInput } from '../hooks/useAttendance';
import AttendanceForm from '../components/attendance/AttendanceForm';
import FormModal from '../components/ui/FormModal';
import DeleteConfirmDialog from '../components/ui/DeleteConfirmDialog';
import { useToast } from '../components/ui/Toast';

const STATUS_STYLES = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
};

export default function Attendance() {
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: records = [], isLoading, isError } = useAttendance(
    dateFilter ? { date: dateFilter } : undefined
  );

  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AttendanceWithDetails | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceWithDetails | null>(null);

  const filtered = statusFilter
    ? records.filter(r => r.status === statusFilter)
    : records;

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (r: AttendanceWithDetails) => { setEditTarget(r); setModalOpen(true); };

  const handleSubmit = async (data: AttendanceInput) => {
    try {
      if (editTarget) {
        await updateAttendance.mutateAsync({ id: editTarget.id, ...data });
        showToast('Attendance record updated.');
      } else {
        await createAttendance.mutateAsync(data);
        showToast('Attendance record added.');
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAttendance.mutateAsync(deleteTarget.id);
      showToast('Record deleted.');
    } catch {
      showToast('Failed to delete.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const isPending = createAttendance.isPending || updateAttendance.isPending;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track student attendance per class session.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Attendance
        </button>
      </div>

      {isError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Could not load attendance. Check that the <code className="font-mono mx-1">attendance</code> table exists in Supabase.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
        {(dateFilter || statusFilter) && (
          <button
            onClick={() => { setDateFilter(''); setStatusFilter(''); }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                {['Date', 'Student', 'Course', 'Status', 'Notes', ''].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[80, 160, 160, 70, 120, 60].map((w, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    <CalendarCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    {dateFilter || statusFilter
                      ? 'No records match your filters.'
                      : 'No attendance records yet. Click "Record Attendance" to start.'}
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {r.students
                        ? `${r.students.first_name} ${r.students.last_name}`
                        : <span className="text-gray-400 italic text-xs">Unknown</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[180px] truncate">
                      {r.courses?.title ?? <span className="text-gray-400 italic text-xs">Unknown</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[160px] truncate">
                      {r.notes ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Attendance Record' : 'Record Attendance'}
        formId="attendance-form"
        isSubmitting={isPending}
        submitLabel={editTarget ? 'Save Changes' : 'Save Record'}
      >
        <AttendanceForm defaultValues={editTarget ?? undefined} onSubmit={handleSubmit} />
      </FormModal>

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirmDialog
          title="Delete attendance record?"
          description="This attendance record will be permanently removed."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteAttendance.isPending}
        />
      )}
    </div>
  );
}
