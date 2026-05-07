import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown } from 'lucide-react';
import type { Student, Course, EnrollmentWithDetails } from '../../types';
import type { EnrollmentInput } from '../../hooks/useEnrollments';

const schema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  course_id: z.string().min(1, 'Course is required'),
  semester: z.enum(['fall', 'spring', 'summer']),
  year: z.number({ error: 'Year must be a number' }).int().min(2000).max(2100),
  grade: z.string().optional(),
  status: z.enum(['enrolled', 'completed', 'dropped', 'failed']),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  enrollment?: EnrollmentWithDetails;
  students: Student[];
  courses: Course[];
  onSubmit: (data: EnrollmentInput) => void;
  isSubmitting: boolean;
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
const errCls = 'border-red-400 focus:ring-red-500';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

// Combobox for searching students
function StudentCombobox({
  value,
  onChange,
  students,
  hasError,
}: {
  value: string;
  onChange: (id: string) => void;
  students: Student[];
  hasError?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = students.find(s => s.id === value);

  const filtered = useMemo(() => {
    if (selected) return [];
    const q = query.toLowerCase();
    const list = q
      ? students.filter(
          s =>
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
            s.student_id.toLowerCase().includes(q)
        )
      : students;
    return list.slice(0, 10);
  }, [query, students, selected]);

  const displayValue = selected
    ? `${selected.first_name} ${selected.last_name} — ${selected.student_id}`
    : query;

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={e => {
          if (selected) onChange('');
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => { if (!selected) setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search by name or student ID…"
        className={`${inputCls} ${hasError ? errCls : ''} pr-8`}
        autoComplete="off"
      />
      {selected && (
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => { onChange(''); setQuery(''); setOpen(true); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
          aria-label="Clear selection"
        >
          ✕
        </button>
      )}
      {open && filtered.length > 0 && (
        <ul className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.map(s => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => { onChange(s.id); setQuery(''); setOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 flex items-center justify-between gap-3"
              >
                <span className="font-medium text-gray-900 truncate">
                  {s.first_name} {s.last_name}
                </span>
                <span className="text-xs text-gray-400 font-mono flex-shrink-0">{s.student_id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'W', 'IP'];

export default function EnrollmentForm({ enrollment, students, courses, onSubmit, isSubmitting }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: enrollment
      ? {
          student_id: enrollment.student_id,
          course_id: enrollment.course_id,
          semester: enrollment.semester,
          year: enrollment.year,
          grade: enrollment.grade ?? '',
          status: enrollment.status,
        }
      : {
          student_id: '',
          course_id: '',
          semester: 'fall',
          year: new Date().getFullYear(),
          grade: '',
          status: 'enrolled',
        },
  });

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({
      student_id: values.student_id,
      course_id: values.course_id,
      semester: values.semester,
      year: values.year,
      grade: values.grade || null,
      status: values.status,
    });
  };

  return (
    <form id="enrollment-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Student */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Student <span className="text-red-500">*</span>
        </label>
        <Controller
          name="student_id"
          control={control}
          render={({ field }) => (
            <StudentCombobox
              value={field.value}
              onChange={field.onChange}
              students={students}
              hasError={!!errors.student_id}
            />
          )}
        />
        <FieldError message={errors.student_id?.message} />
      </div>

      {/* Course */}
      <div>
        <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
          Course <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            id="course_id"
            {...register('course_id')}
            className={`${inputCls} appearance-none pr-8 ${errors.course_id ? errCls : ''}`}
          >
            <option value="">Select a course</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.course_code} — {c.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <FieldError message={errors.course_id?.message} />
      </div>

      {/* Semester + Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
            Semester <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="semester"
              {...register('semester')}
              className={`${inputCls} appearance-none pr-8`}
            >
              <option value="fall">Fall</option>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year <span className="text-red-500">*</span>
          </label>
          <input
            id="year"
            type="number"
            min={2000}
            max={2100}
            {...register('year', { valueAsNumber: true })}
            className={`${inputCls} ${errors.year ? errCls : ''}`}
          />
          <FieldError message={errors.year?.message} />
        </div>
      </div>

      {/* Grade + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
            Grade
          </label>
          <div className="relative">
            <select id="grade" {...register('grade')} className={`${inputCls} appearance-none pr-8`}>
              <option value="">No grade yet</option>
              {GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select id="status" {...register('status')} className={`${inputCls} appearance-none pr-8`}>
              <option value="enrolled">Enrolled</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <button type="submit" form="enrollment-form" disabled={isSubmitting} className="hidden" aria-hidden="true" />
    </form>
  );
}
