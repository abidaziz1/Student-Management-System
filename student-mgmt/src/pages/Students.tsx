import { Users } from 'lucide-react';

export default function Students() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-500 mt-1">Manage student records and profiles.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <Users className="w-7 h-7 text-blue-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Students</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Student list, search, filters, and CRUD operations coming soon.
        </p>
      </div>
    </div>
  );
}
