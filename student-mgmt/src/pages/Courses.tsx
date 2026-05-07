import { BookOpen } from 'lucide-react';

export default function Courses() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-500 mt-1">Browse and manage course catalog.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <BookOpen className="w-7 h-7 text-blue-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Courses</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Course catalog, department filtering, and course management coming soon.
        </p>
      </div>
    </div>
  );
}
