import { ClipboardList } from 'lucide-react';

export default function Enrollments() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
        <p className="text-gray-500 mt-1">Track course enrollments and grades.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <ClipboardList className="w-7 h-7 text-blue-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Enrollments</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Enrollment records, semester filtering, grade tracking, and reports coming soon.
        </p>
      </div>
    </div>
  );
}
