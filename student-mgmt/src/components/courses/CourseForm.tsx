import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CourseWithDepartment } from '../../types';
import type { CourseInput } from '../../hooks/useCourses';
import type { Department } from '../../types';

const schema = z.object({
  course_code: z.string().min(1, 'Course code is required').max(20, 'Max 20 characters'),
  title: z.string().min(1, 'Title is required'),
  credits: z.number({ error: 'Credits must be a number' }).int().min(1, 'Min 1 credit').max(6, 'Max 6 credits'),
  department_id: z.string().min(1, 'Department is required'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  course?: CourseWithDepartment;
  departments: Department[];
  onSubmit: (data: CourseInput) => void;
  isSubmitting: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
const errCls = 'border-red-400 focus:ring-red-500';

export default function CourseForm({ course, departments, onSubmit, isSubmitting }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: course
      ? {
          course_code: course.course_code,
          title: course.title,
          credits: course.credits,
          department_id: course.department_id,
          description: course.description ?? '',
        }
      : { course_code: '', title: '', credits: 3, department_id: '', description: '' },
  });

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({
      course_code: values.course_code,
      title: values.title,
      credits: values.credits,
      department_id: values.department_id,
      description: values.description || null,
    });
  };

  return (
    <form id="course-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="course_code" className="block text-sm font-medium text-gray-700 mb-1">
            Course Code <span className="text-red-500">*</span>
          </label>
          <input
            id="course_code"
            {...register('course_code')}
            className={`${inputCls} ${errors.course_code ? errCls : ''}`}
            placeholder="e.g. CS101"
          />
          <FieldError message={errors.course_code?.message} />
        </div>
        <div>
          <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-1">
            Credits <span className="text-red-500">*</span>
          </label>
          <input
            id="credits"
            type="number"
            min={1}
            max={6}
            {...register('credits', { valueAsNumber: true })}
            className={`${inputCls} ${errors.credits ? errCls : ''}`}
          />
          <FieldError message={errors.credits?.message} />
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Course Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          {...register('title')}
          className={`${inputCls} ${errors.title ? errCls : ''}`}
          placeholder="e.g. Introduction to Computer Science"
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div>
        <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
          Department <span className="text-red-500">*</span>
        </label>
        <select
          id="department_id"
          {...register('department_id')}
          className={`${inputCls} ${errors.department_id ? errCls : ''}`}
        >
          <option value="">Select a department</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
        <FieldError message={errors.department_id?.message} />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className={`${inputCls} resize-none`}
          placeholder="Brief description of the course..."
        />
      </div>

      <button type="submit" form="course-form" disabled={isSubmitting} className="hidden" aria-hidden="true" />
    </form>
  );
}
