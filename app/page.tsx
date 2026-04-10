'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckSquare,
  BookOpen,
  Target,
  Bookmark,
  TrendingUp,
  Plus,
  Clock,
  Star,
} from 'lucide-react';
import { getNotes, getTasks, getJournalEntries, getGoals, getBookmarks } from '@/lib/store';
import { Note, Task, Goal } from '@/lib/types';
import { formatRelative, todayISO } from '@/lib/utils';

interface Stats {
  notes: number;
  tasks: { total: number; done: number };
  journalStreak: number;
  goals: { total: number; done: number };
  bookmarks: number;
  recentNotes: Note[];
  pendingTasks: Task[];
  activeGoals: Goal[];
}

function computeStats(): Stats {
  const notes = getNotes();
  const tasks = getTasks();
  const journal = getJournalEntries();
  const goals = getGoals();
  const bookmarks = getBookmarks();

  let streak = 0;
  const today = new Date(todayISO());
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (journal.some((e) => e.date === iso)) {
      streak++;
    } else {
      break;
    }
  }

  return {
    notes: notes.length,
    tasks: { total: tasks.length, done: tasks.filter((t) => t.completed).length },
    journalStreak: streak,
    goals: { total: goals.length, done: goals.filter((g) => g.completed).length },
    bookmarks: bookmarks.length,
    recentNotes: [...notes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4),
    pendingTasks: tasks
      .filter((t) => !t.completed)
      .sort((a, b) => {
        const p = { high: 0, medium: 1, low: 2 };
        return p[a.priority] - p[b.priority];
      })
      .slice(0, 5),
    activeGoals: goals.filter((g) => !g.completed).slice(0, 3),
  };
}

const priorityColor: Record<string, string> = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-emerald-400',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    setStats(computeStats());
  }, []);

  if (!stats) return null;

  const taskPct =
    stats.tasks.total > 0
      ? Math.round((stats.tasks.done / stats.tasks.total) * 100)
      : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-slate-500 text-sm mb-1">{today}</p>
        <h1 className="text-3xl font-bold text-white">Good day!</h1>
        <p className="text-slate-400 mt-1">Here&apos;s what&apos;s in your second brain.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { href: '/notes', icon: FileText, label: 'Notes', value: stats.notes, color: 'bg-violet-600' },
          {
            href: '/tasks',
            icon: CheckSquare,
            label: 'Tasks done',
            value: `${stats.tasks.done}/${stats.tasks.total}`,
            color: 'bg-blue-600',
          },
          { href: '/journal', icon: BookOpen, label: 'Day streak', value: `${stats.journalStreak}d`, color: 'bg-emerald-600' },
          {
            href: '/goals',
            icon: Target,
            label: 'Goals done',
            value: `${stats.goals.done}/${stats.goals.total}`,
            color: 'bg-amber-600',
          },
          { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks', value: stats.bookmarks, color: 'bg-rose-600' },
        ].map(({ href, icon: Icon, label, value, color }) => (
          <Link
            key={href}
            href={href}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
          >
            <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={18} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Task progress */}
      {stats.tasks.total > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-400" />
              <span className="font-semibold text-white">Task Progress</span>
            </div>
            <span className="text-sm text-slate-400">{taskPct}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${taskPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {stats.tasks.done} of {stats.tasks.total} tasks completed
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-violet-400" />
              <span className="font-semibold text-white">Recent Notes</span>
            </div>
            <Link href="/notes" className="text-xs text-violet-400 hover:text-violet-300">
              View all
            </Link>
          </div>
          {stats.recentNotes.length === 0 ? (
            <EmptyState href="/notes" label="Create your first note" />
          ) : (
            <ul className="space-y-1">
              {stats.recentNotes.map((n) => (
                <li key={n.id}>
                  <Link
                    href="/notes"
                    className="block p-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-slate-200 font-medium line-clamp-1">
                        {n.title || 'Untitled'}
                      </span>
                      {n.pinned && <Star size={12} className="text-amber-400 mt-0.5 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={11} className="text-slate-600" />
                      <span className="text-xs text-slate-500">{formatRelative(n.updatedAt)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare size={16} className="text-blue-400" />
              <span className="font-semibold text-white">Pending Tasks</span>
            </div>
            <Link href="/tasks" className="text-xs text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          {stats.pendingTasks.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">All caught up!</p>
          ) : (
            <ul className="space-y-2">
              {stats.pendingTasks.map((t) => (
                <li key={t.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-800">
                  <div className="w-4 h-4 rounded border border-slate-600 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 line-clamp-1">{t.title}</p>
                    <span className={`text-xs font-medium ${priorityColor[t.priority]}`}>
                      {t.priority}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active Goals */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-amber-400" />
              <span className="font-semibold text-white">Active Goals</span>
            </div>
            <Link href="/goals" className="text-xs text-amber-400 hover:text-amber-300">
              View all
            </Link>
          </div>
          {stats.activeGoals.length === 0 ? (
            <EmptyState href="/goals" label="Set your first goal" />
          ) : (
            <ul className="space-y-3">
              {stats.activeGoals.map((g) => (
                <li key={g.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-200 line-clamp-1">{g.title}</span>
                    <span className="text-xs text-slate-500">{g.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors py-2"
    >
      <Plus size={14} />
      {label}
    </Link>
  );
}
