'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  BookOpen,
  Target,
  Bookmark,
  Brain,
} from 'lucide-react';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ width: 'var(--sidebar-w)' }}
      className="fixed top-0 left-0 h-screen flex flex-col bg-slate-900 border-r border-slate-800 z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-800">
        <div className="p-1.5 rounded-lg bg-violet-600">
          <Brain size={18} className="text-white" />
        </div>
        <span className="font-bold text-white tracking-tight">Second Brain</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-800 text-xs text-slate-600">
        Your personal knowledge base
      </div>
    </aside>
  );
}
