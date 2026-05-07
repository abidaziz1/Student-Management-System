import { useState } from 'react';
import { UserCog, Plus, Pencil, Trash2, AlertCircle, Search } from 'lucide-react';
import { useFaculty, useCreateFaculty, useUpdateFaculty, useDeleteFaculty } from '../hooks/useFaculty';
import type { FacultyWithDepartment } from '../types';
import type { FacultyInput } from '../hooks/useFaculty';
import FacultyForm from '../components/faculty/FacultyForm';
import FormModal from '../components/ui/FormModal';
import DeleteConfirmDialog from '../components/ui/DeleteConfirmDialog';
import { useToast } from '../components/ui/Toast';

export default function Faculty() {
  const { data: faculty = [], isLoading, isError } = useFaculty();
  const createFaculty = useCreateFaculty();
  const updateFaculty = useUpdateFaculty();
  const deleteFaculty = useDeleteFaculty();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FacultyWithDepartment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FacultyWithDepartment | null>(null);

  const filtered = faculty.filter(f =>
    `${f.name} ${f.email} ${f.title ?? ''} ${f.departments?.name ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (f: FacultyWithDepartment) => { setEditTarget(f); setModalOpen(true); };

  const handleSubmit = async (data: FacultyInput) => {
    try {
      if (editTarget) {
        await updateFaculty.mutateAsync({ id: editTarget.id, ...data });
        showToast('Faculty member updated.');
      } else {
        await createFaculty.mutateAsync(data);
        showToast('Faculty member added.');
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFaculty.mutateAsync(deleteTarget.id);
      showToast('Faculty member deleted.');
    } catch {
      showToast('Failed to delete.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const isPending = createFaculty.isPending || updateFaculty.isPending;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faculty</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage instructors and staff.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Faculty
        </button>
      </div>

      {isError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Could not load faculty. Check that the <code className="font-mono mx-1">faculty</code> table exists in Supabase.
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search faculty…"
          className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                {['Name', 'Email', 'Title', 'Department', 'Phone', ''].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {[160, 200, 120, 120, 120, 60].map((w, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    <UserCog className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    {search ? 'No faculty match your search.' : 'No faculty yet. Click "Add Faculty" to get started.'}
                  </td>
                </tr>
              ) : (
                filtered.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {f.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{f.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {f.title ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {f.departments ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          {f.departments.code}
                        </span>
                      ) : <span className="text-gray-300 text-sm">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {f.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(f)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(f)}
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
        title={editTarget ? 'Edit Faculty Member' : 'Add Faculty Member'}
        formId="faculty-form"
        isSubmitting={isPending}
        submitLabel={editTarget ? 'Save Changes' : 'Add Faculty'}
      >
        <FacultyForm defaultValues={editTarget ?? undefined} onSubmit={handleSubmit} />
      </FormModal>

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirmDialog
          title="Delete faculty member?"
          description={`"${deleteTarget.name}" will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteFaculty.isPending}
        />
      )}
    </div>
  );
}
