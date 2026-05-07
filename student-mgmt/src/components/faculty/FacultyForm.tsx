import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDepartments } from '../../hooks/useCourses';
import type { FacultyWithDepartment } from '../../types';
import type { FacultyInput } from '../../hooks/useFaculty';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  title: z.string().optional(),
  department_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: FacultyWithDepartment;
  onSubmit: (data: FacultyInput) => void;
}

export default function FacultyForm({ defaultValues, onSubmit }: Props) {
  const { data: departments = [] } = useDepartments();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name,
        email: defaultValues.email,
        phone: defaultValues.phone ?? '',
        title: defaultValues.title ?? '',
        department_id: defaultValues.department_id ?? '',
      });
    } else {
      reset({ name: '', email: '', phone: '', title: '', department_id: '' });
    }
  }, [defaultValues, reset]);

  const submit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      title: values.title || null,
      department_id: values.department_id || null,
    });
  };

  const field = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const label = 'block text-sm font-medium text-gray-700 mb-1';
  const errCls = 'text-xs text-red-500 mt-1';

  return (
    <form id="faculty-form" onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className={label}>Full Name *</label>
        <input {...register('name')} className={field} placeholder="Dr. Jane Smith" />
        {errors.name && <p className={errCls}>{errors.name.message}</p>}
      </div>

      <div>
        <label className={label}>Email *</label>
        <input {...register('email')} type="email" className={field} placeholder="jane@university.edu" />
        {errors.email && <p className={errCls}>{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Phone</label>
          <input {...register('phone')} className={field} placeholder="+880 1712 345678" />
        </div>
        <div>
          <label className={label}>Title / Position</label>
          <input {...register('title')} className={field} placeholder="Associate Professor" />
        </div>
      </div>

      <div>
        <label className={label}>Department</label>
        <select {...register('department_id')} className={field}>
          <option value="">— No department —</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
    </form>
  );
}
