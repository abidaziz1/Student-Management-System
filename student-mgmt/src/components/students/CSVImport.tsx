import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, X, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { useCreateStudent } from '../../hooks/useStudents';
import type { StudentInput } from '../../hooks/useStudents';

interface RawRow {
  first_name?: string;
  last_name?: string;
  email?: string;
  student_id?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  enrollment_date?: string;
  status?: string;
  [key: string]: string | undefined;
}

interface ParsedStudent {
  row: number;
  data: StudentInput;
  errors: string[];
}

const VALID_STATUSES = ['active', 'inactive', 'graduated', 'suspended'];
const VALID_GENDERS = ['male', 'female', 'other'];

function parseRow(raw: RawRow, rowNum: number): ParsedStudent {
  const errors: string[] = [];

  if (!raw.first_name?.trim()) errors.push('first_name is required');
  if (!raw.last_name?.trim()) errors.push('last_name is required');
  if (!raw.email?.trim()) errors.push('email is required');
  if (!raw.student_id?.trim()) errors.push('student_id is required');
  if (!raw.enrollment_date?.trim()) errors.push('enrollment_date is required');

  const status = raw.status?.toLowerCase() ?? 'active';
  if (raw.status && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const gender = raw.gender?.toLowerCase() ?? null;
  if (raw.gender && !VALID_GENDERS.includes(gender ?? '')) {
    errors.push(`gender must be one of: ${VALID_GENDERS.join(', ')}`);
  }

  return {
    row: rowNum,
    errors,
    data: {
      first_name: raw.first_name?.trim() ?? '',
      last_name: raw.last_name?.trim() ?? '',
      email: raw.email?.trim() ?? '',
      student_id: raw.student_id?.trim() ?? '',
      phone: raw.phone?.trim() || null,
      date_of_birth: raw.date_of_birth?.trim() || null,
      gender: VALID_GENDERS.includes(gender ?? '') ? (gender as StudentInput['gender']) : null,
      address: raw.address?.trim() || null,
      enrollment_date: raw.enrollment_date?.trim() ?? new Date().toISOString().split('T')[0],
      status: VALID_STATUSES.includes(status) ? (status as StudentInput['status']) : 'active',
    },
  };
}

interface Props {
  onClose: () => void;
}

type Phase = 'pick' | 'preview' | 'importing' | 'done';

export default function CSVImport({ onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('pick');
  const [parsed, setParsed] = useState<ParsedStudent[]>([]);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const createStudent = useCreateStudent();

  const handleFile = (file: File) => {
    setFileName(file.name);
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const rows = data.map((row, i) => parseRow(row, i + 2));
        setParsed(rows);
        setPhase('preview');
      },
    });
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) handleFile(file);
  };

  const validRows = parsed.filter(r => r.errors.length === 0);
  const invalidRows = parsed.filter(r => r.errors.length > 0);

  const runImport = async () => {
    setPhase('importing');
    let success = 0;
    let failed = 0;
    for (const row of validRows) {
      try {
        await createStudent.mutateAsync(row.data);
        success++;
      } catch {
        failed++;
      }
    }
    setResults({ success, failed });
    setPhase('done');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Upload className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Import Students from CSV</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Phase: pick file */}
          {phase === 'pick' && (
            <>
              <div
                onDrop={onDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">Drop your CSV file here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Only .csv files are accepted</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onInputChange} />

              {/* Template hint */}
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Expected CSV columns:</p>
                <code className="text-xs text-gray-500 break-all">
                  first_name, last_name, email, student_id, enrollment_date, status, phone, gender, address, date_of_birth
                </code>
                <p className="text-xs text-gray-400 mt-1.5">
                  Required: <span className="font-medium">first_name, last_name, email, student_id, enrollment_date</span>
                </p>
              </div>
            </>
          )}

          {/* Phase: preview */}
          {phase === 'preview' && (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                  <p className="text-xs text-gray-500">
                    {parsed.length} rows · {validRows.length} valid · {invalidRows.length} with errors
                  </p>
                </div>
                <button
                  onClick={() => { setParsed([]); setPhase('pick'); }}
                  className="text-xs text-blue-600 hover:underline flex-shrink-0"
                >
                  Change file
                </button>
              </div>

              {invalidRows.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {invalidRows.length} row(s) have validation errors and will be skipped:
                  </p>
                  <ul className="space-y-1 max-h-32 overflow-y-auto">
                    {invalidRows.map(r => (
                      <li key={r.row} className="text-xs text-red-600">
                        Row {r.row}: {r.errors.join('; ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validRows.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        {['First Name', 'Last Name', 'Email', 'Student ID', 'Enroll Date', 'Status'].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-gray-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {validRows.slice(0, 10).map(r => (
                        <tr key={r.row} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{r.data.first_name}</td>
                          <td className="px-3 py-2">{r.data.last_name}</td>
                          <td className="px-3 py-2 max-w-[160px] truncate">{r.data.email}</td>
                          <td className="px-3 py-2 font-mono">{r.data.student_id}</td>
                          <td className="px-3 py-2">{r.data.enrollment_date}</td>
                          <td className="px-3 py-2 capitalize">{r.data.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {validRows.length > 10 && (
                    <p className="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
                      … and {validRows.length - 10} more rows
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Phase: importing */}
          {phase === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">Importing {validRows.length} students…</p>
            </div>
          )}

          {/* Phase: done */}
          {phase === 'done' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <div>
                <p className="font-semibold text-gray-900 text-lg">{results.success} student{results.success !== 1 ? 's' : ''} imported!</p>
                {results.failed > 0 && (
                  <p className="text-sm text-red-500 mt-1">{results.failed} failed (duplicate email/ID or server error).</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {phase === 'preview' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {validRows.length} student{validRows.length !== 1 ? 's' : ''} will be imported
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={runImport}
                disabled={validRows.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                Import {validRows.length} Students
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
