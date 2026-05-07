import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, ClipboardList, GraduationCap } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/students', label: 'Students', icon: Users, end: false },
  { to: '/courses', label: 'Courses', icon: BookOpen, end: false },
  { to: '/enrollments', label: 'Enrollments', icon: ClipboardList, end: false },
];

interface Props {
  onNavClick?: () => void;
}

export default function Sidebar({ onNavClick }: Props) {
  return (
    <aside className="w-64 h-full min-h-screen bg-[#1e2a3b] flex flex-col scrollbar-thin overflow-y-auto">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">UniAdmin</p>
          <p className="text-slate-400 text-xs">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10 flex-shrink-0">
        <p className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} UniAdmin</p>
      </div>
    </aside>
  );
}
