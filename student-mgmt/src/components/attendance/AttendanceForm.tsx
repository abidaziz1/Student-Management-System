import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStudents } from '../../hooks/useStudents';
import { useCourses } from '../../hooks/useCourses';
import type { AttendanceWithDetails } from '../../types';
import type { AttendanceInput } from '../../hooks/useAttendance';

const schema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  course_id: z.string().min(1, 'Course is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['present', 'absent', 'late']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: AttendanceWithDetails;
  onSubmit: (data: AttendanceInput) => void;
}

export default function AttendanceForm({ defaultValues, onSubmit }: Props) {
  const { data: students = [] } = useStudents();
  const { data: courses = [] } = useCourses();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (defaultValues) {
      reset({
        student_id: defaultValues.student_id,
        course_id: defaultValues.course_id,
        date: defaultValues.date,
        status: defaultValues.status,
        notes: defaultValues.notes ?? '',
      });
    } else {
      reset({
        student_id: '',
        course_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        notes: '',
      });
    }
  }, [defaultValues, reset]);

  const submit = (values: FormValues) => {
    onSubmit({
      student_id: values.student_id,
      course_id: values.course_id,
      date: values.date,
      status: values.status,
      notes: values.notes || null,
    });
  };

  const field = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const label = 'block text-sm font-medium text-gray-700 mb-1';
  const errCls = 'text-xs text-red-500 mt-1';

  return (
    <form id="attendance-form" onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className={label}>Student *</label>
        <select {...register('student_id')} className={field}>
          <option value="">— Select student —</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.first_name} {s.last_name} ({s.student_id})
            </option>
          ))}
        </select>
        {errors.student_id && <p className={errCls}>{errors.student_id.message}</p>}
      </div>

      <div>
        <label className={label}>Course *</label>
        <select {...register('course_id')} className={field}>
          <option value="">— Select course —</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.course_code} — {c.title}
            </option>
          ))}
        </select>
        {errors.course_id && <p className={errCls}>{errors.course_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Date *</label>
          <input {...register('date')} type="date" className={field} />
          {errors.date && <p className={errCls}>{errors.date.message}</p>}
        </div>

        <div>
          <label className={label}>Status *</label>
          <select {...register('status')} className={field}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className={field}
          placeholder="Optional notes…"
        />
      </div>
    </form>
  );
}
