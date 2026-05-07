import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import Sidebar from './Sidebar';
import { ToastProvider } from '../ui/Toast';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Close sidebar on route change (handles mobile nav taps)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sidebarOpen]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        {/*
          Mobile: fixed overlay, slides in from left when sidebarOpen.
          Desktop (md+): static in the flex flow, always visible.
        */}
        <div
          className={[
            'fixed inset-y-0 left-0 z-30',
            'transition-transform duration-200 ease-in-out',
            'md:static md:translate-x-0 md:flex md:flex-shrink-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
          aria-label="Sidebar navigation"
        >
          <Sidebar onNavClick={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Content area ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-10 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden flex-shrink-0 shadow-sm">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">UniAdmin</span>
            </div>

            {/* Spacer to balance the hamburger on the left */}
            <div className="w-8" />
          </header>

          {/* Page content with fade-in on route change */}
          <main className="flex-1 overflow-auto">
            <div key={pathname} className="page-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
