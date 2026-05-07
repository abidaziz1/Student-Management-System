import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, BookOpen, ClipboardList, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SearchResult {
  id: string;
  type: 'student' | 'course' | 'enrollment';
  title: string;
  subtitle: string;
  url: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const TYPE_ICON = {
  student: Users,
  course: BookOpen,
  enrollment: ClipboardList,
};

const TYPE_LABEL = {
  student: 'Student',
  course: 'Course',
  enrollment: 'Enrollment',
};

const TYPE_COLOR: Record<string, string> = {
  student: 'text-blue-500 bg-blue-50',
  course: 'text-purple-500 bg-purple-50',
  enrollment: 'text-amber-500 bg-amber-50',
};

export default function GlobalSearch({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => runSearch(query.trim()), 280);
    return () => clearTimeout(timer);
  }, [query]);

  const runSearch = async (q: string) => {
    setLoading(true);
    try {
      const like = `%${q}%`;
      const [stuRes, courseRes] = await Promise.all([
        supabase
          .from('students')
          .select('id, first_name, last_name, student_id, email, status')
          .or(`first_name.ilike.${like},last_name.ilike.${like},student_id.ilike.${like},email.ilike.${like}`)
          .limit(5),
        supabase
          .from('courses')
          .select('id, course_code, title, description')
          .or(`course_code.ilike.${like},title.ilike.${like}`)
          .limit(5),
      ]);

      const out: SearchResult[] = [];

      (stuRes.data ?? []).forEach(s => {
        out.push({
          id: s.id,
          type: 'student',
          title: `${s.first_name} ${s.last_name}`,
          subtitle: `${s.student_id} · ${s.email} · ${s.status}`,
          url: `/students/${s.id}`,
        });
      });

      (courseRes.data ?? []).forEach(c => {
        out.push({
          id: c.id,
          type: 'course',
          title: `${c.course_code} — ${c.title}`,
          subtitle: c.description ?? 'No description',
          url: '/courses',
        });
      });

      setResults(out);
      setActiveIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const goTo = useCallback(
    (url: string) => {
      navigate(url);
      onClose();
    },
    [navigate, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      goTo(results[activeIndex].url);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          {loading
            ? <Loader2 className="w-5 h-5 text-gray-400 flex-shrink-0 animate-spin" />
            : <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />}
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search students, courses…"
            className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              Esc
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((r, i) => {
              const Icon = TYPE_ICON[r.type];
              return (
                <li key={`${r.type}-${r.id}`}>
                  <button
                    onClick={() => goTo(r.url)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === activeIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[r.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.title}</p>
                      <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>
                    </div>
                    <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                      {TYPE_LABEL[r.type]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Empty state */}
        {query && !loading && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No results for <span className="font-medium text-gray-600 dark:text-gray-300">"{query}"</span>
          </div>
        )}

        {/* Hint */}
        {!query && (
          <div className="px-4 py-5 text-center text-xs text-gray-400">
            Type to search across students and courses
          </div>
        )}

        {/* Footer hints */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-400">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">Esc</kbd> close</span>
          </div>
        )}
      </div>
    </div>
  );
}
