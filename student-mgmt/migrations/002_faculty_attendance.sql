-- ─── Faculty ──────────────────────────────────────────────────────────────────
create table if not exists faculty (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  phone         text,
  title         text,
  department_id uuid references departments(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ─── Attendance ───────────────────────────────────────────────────────────────
create table if not exists attendance (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  course_id  uuid not null references courses(id) on delete cascade,
  date       date not null,
  status     text not null check (status in ('present', 'absent', 'late')),
  notes      text,
  created_at timestamptz not null default now()
);

-- Useful indexes
create index if not exists attendance_student_idx on attendance(student_id);
create index if not exists attendance_course_idx  on attendance(course_id);
create index if not exists attendance_date_idx    on attendance(date);
