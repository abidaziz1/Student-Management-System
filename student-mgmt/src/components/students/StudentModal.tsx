import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Student } from '../../types';
import type { StudentInput } from '../../hooks/useStudents';
import StudentForm from './StudentForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
  onSubmit: (data: StudentInput) => void;
  isSubmitting: boolean;
}

export default function StudentModal({ isOpen, onClose, student, onSubmit, isSubmitting }: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const title = student ? 'Edit Student' : 'Add Student';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {/* key forces form remount when switching create/edit */}
          <StudentForm
            key={student?.id ?? 'new'}
            student={student}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="student-form"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {student ? 'Save Changes' : 'Create Student'}
          </button>
        </div>
      </div>
    </div>
  );
}
