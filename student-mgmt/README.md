# UniAdmin — Student Management System

A full-featured university admin dashboard for managing students, courses, and enrollments. Built with React, TypeScript, Supabase, and Tailwind CSS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) + [Vite](https://vite.dev) |
| Language | TypeScript 6 |
| Styling | [Tailwind CSS v3](https://tailwindcss.com) |
| Backend / DB | [Supabase](https://supabase.com) (PostgreSQL + Row-Level Security) |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) |
| Forms | [React Hook Form v7](https://react-hook-form.com) + [Zod v4](https://zod.dev) |
| Routing | [React Router v7](https://reactrouter.com) |
| Charts | [Recharts v3](https://recharts.org) |
| Icons | [Lucide React](https://lucide.dev) |
| Deployment | [Vercel](https://vercel.com) |

---

## Features

- **Dashboard** — live stats cards, enrollment-by-status bar chart, courses-by-department pie chart, recent students & enrollments tables
- **Students** — full CRUD with search, status filter, skeleton loading, delete confirmation
- **Student Detail** — profile card with avatar, all fields, enrolled-courses history table
- **Courses** — card grid layout, department filter, add/edit/delete modal
- **Enrollments** — table with grade badges, semester/year/status filters, duplicate-enrollment guard
- **Responsive** — collapsible sidebar on mobile with hamburger menu and overlay
- **Accessible** — keyboard navigation, Esc-to-close modals, ARIA labels
- **Error handling** — React Error Boundary, per-page error banners, toast notifications

---

## Local Setup

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/abidaziz1/student-management-system.git
cd student-management-system/student-mgmt
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Both values are found in your Supabase project → **Settings → API**.

### 3. Create Supabase tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- Departments
create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique
);

-- Students
create table students (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  date_of_birth date,
  gender text check (gender in ('male','female','other')),
  address text,
  enrollment_date date not null default current_date,
  status text not null default 'active' check (status in ('active','inactive','graduated','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Courses
create table courses (
  id uuid primary key default gen_random_uuid(),
  course_code text not null unique,
  title text not null,
  credits int not null check (credits between 1 and 6),
  department_id uuid references departments(id) on delete set null,
  description text
);

-- Enrollments
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  semester text not null check (semester in ('fall','spring','summer')),
  year int not null,
  grade text,
  status text not null default 'enrolled' check (status in ('enrolled','completed','dropped','failed')),
  enrolled_at timestamptz not null default now()
);
```

> **Tip:** Enable Row-Level Security and add policies in Supabase if you plan to expose this to end users.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Vercel Deployment

### Quick deploy

1. **Push to GitHub** — make sure your code is on a GitHub repo.

2. **Import to Vercel** — go to [vercel.com/new](https://vercel.com/new), import your repository, and set the **Root Directory** to `student-mgmt` (or wherever `package.json` lives).

3. **Add environment variables** in the Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Deploy** — Vercel will run `npm run build` and serve the `dist/` folder.

The `vercel.json` already includes SPA rewrites so all client-side routes work correctly after a hard refresh:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Supabase Schema Summary

| Table | Key columns |
|---|---|
| `departments` | `id`, `name`, `code` |
| `students` | `id`, `student_id`, `first_name`, `last_name`, `email`, `phone`, `date_of_birth`, `gender`, `address`, `enrollment_date`, `status`, `created_at`, `updated_at` |
| `courses` | `id`, `course_code`, `title`, `credits`, `department_id` (FK → departments), `description` |
| `enrollments` | `id`, `student_id` (FK → students), `course_id` (FK → courses), `semester`, `year`, `grade`, `status`, `enrolled_at` |

---

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # TypeScript check + production build → dist/
npm run preview  # Preview the production build locally
npm run lint     # ESLint
```
