import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Student } from '../../types';
import type { StudentInput } from '../../hooks/useStudents';

const schema = z.object({
  student_id: z
    .string()
    .min(1, 'Student ID is required')
    .regex(/^[a-zA-Z0-9]+$/, 'Must be alphanumeric only'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  enrollment_date: z.string().min(1, 'Enrollment date is required'),
  status: z.enum(['active', 'inactive', 'graduated', 'suspended']),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  student?: Student;
  onSubmit: (data: StudentInput) => void;
  isSubmitting: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
const errorInputCls = 'border-red-400 focus:ring-red-500';

export default function StudentForm({ student, onSubmit, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: student
      ? {
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          phone: student.phone ?? '',
          date_of_birth: student.date_of_birth ?? '',
          gender: student.gender ?? '',
          address: student.address ?? '',
          enrollment_date: student.enrollment_date,
          status: student.status,
        }
      : {
          student_id: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          date_of_birth: '',
          gender: '',
          address: '',
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active',
        },
  });

  const handleFormSubmit = (values: FormValues) => {
    const payload: StudentInput = {
      student_id: values.student_id,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone || null,
      date_of_birth: values.date_of_birth || null,
      gender: (values.gender || null) as Student['gender'],
      address: values.address || null,
      enrollment_date: values.enrollment_date,
      status: values.status,
    };
    onSubmit(payload);
  };

  return (
    <form id="student-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Row 1: Student ID */}
      <div>
        <Label htmlFor="student_id" required>Student ID</Label>
        <input
          id="student_id"
          {...register('student_id')}
          className={`${inputCls} ${errors.student_id ? errorInputCls : ''}`}
          placeholder="e.g. STU20240001"
        />
        <FieldError message={errors.student_id?.message} />
      </div>

      {/* Row 2: First / Last name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name" required>First Name</Label>
          <input
            id="first_name"
            {...register('first_name')}
            className={`${inputCls} ${errors.first_name ? errorInputCls : ''}`}
            placeholder="Jane"
          />
          <FieldError message={errors.first_name?.message} />
        </div>
        <div>
          <Label htmlFor="last_name" required>Last Name</Label>
          <input
            id="last_name"
            {...register('last_name')}
            className={`${inputCls} ${errors.last_name ? errorInputCls : ''}`}
            placeholder="Smith"
          />
          <FieldError message={errors.last_name?.message} />
        </div>
      </div>

      {/* Row 3: Email */}
      <div>
        <Label htmlFor="email" required>Email</Label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`${inputCls} ${errors.email ? errorInputCls : ''}`}
          placeholder="jane.smith@university.edu"
        />
        <FieldError message={errors.email?.message} />
      </div>

      {/* Row 4: Phone / Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className={inputCls}
            placeholder="+1 555 000 0000"
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <select id="gender" {...register('gender')} className={inputCls}>
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Row 5: DOB / Enrollment date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <input
            id="date_of_birth"
            type="date"
            {...register('date_of_birth')}
            className={inputCls}
          />
        </div>
        <div>
          <Label htmlFor="enrollment_date" required>Enrollment Date</Label>
          <input
            id="enrollment_date"
            type="date"
            {...register('enrollment_date')}
            className={`${inputCls} ${errors.enrollment_date ? errorInputCls : ''}`}
          />
          <FieldError message={errors.enrollment_date?.message} />
        </div>
      </div>

      {/* Row 6: Status */}
      <div>
        <Label htmlFor="status" required>Status</Label>
        <select
          id="status"
          {...register('status')}
          className={`${inputCls} ${errors.status ? errorInputCls : ''}`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
          <option value="suspended">Suspended</option>
        </select>
        <FieldError message={errors.status?.message} />
      </div>

      {/* Row 7: Address */}
      <div>
        <Label htmlFor="address">Address</Label>
        <textarea
          id="address"
          rows={2}
          {...register('address')}
          className={`${inputCls} resize-none`}
          placeholder="123 University Ave, City, State 00000"
        />
      </div>

      {/* Submit button rendered outside via form="student-form" */}
      <button type="submit" form="student-form" disabled={isSubmitting} className="hidden" aria-hidden="true" />
    </form>
  );
}
