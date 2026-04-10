'use client';

import { useEffect, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { ChevronLeft, ChevronRight, Smile, Meh, Frown, Star, Zap } from 'lucide-react';
import { getJournalEntries, saveJournalEntries } from '@/lib/store';
import { JournalEntry } from '@/lib/types';
import { todayISO, formatDate } from '@/lib/utils';

const MOODS: { value: JournalEntry['mood']; icon: React.ReactNode; label: string; color: string }[] = [
  { value: 1, icon: <Frown size={18} />, label: 'Awful', color: 'text-red-400' },
  { value: 2, icon: <Frown size={18} />, label: 'Bad', color: 'text-orange-400' },
  { value: 3, icon: <Meh size={18} />, label: 'Okay', color: 'text-amber-400' },
  { value: 4, icon: <Smile size={18} />, label: 'Good', color: 'text-emerald-400' },
  { value: 5, icon: <Star size={18} />, label: 'Great', color: 'text-violet-400' },
];

const PROMPTS = [
  "What are you grateful for today?",
  "What was the highlight of your day?",
  "What challenged you today, and what did you learn?",
  "What would make tomorrow even better?",
  "What are you proud of lately?",
  "What's on your mind right now?",
  "Describe a moment of joy from today.",
  "What's one thing you want to remember from this day?",
];

function offsetDate(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(todayISO());
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  const today = todayISO();
  const isToday = currentDate === today;
  const isFuture = currentDate > today;

  const current = entries.find((e) => e.date === currentDate);

  useEffect(() => {
    setEntries(getJournalEntries());
  }, []);

  const persist = useCallback((updated: JournalEntry[]) => {
    setEntries(updated);
    saveJournalEntries(updated);
  }, []);

  const upsert = useCallback(
    (patch: Partial<JournalEntry>) => {
      const now = new Date().toISOString();
      const existing = entries.find((e) => e.date === currentDate);
      if (existing) {
        persist(
          entries.map((e) =>
            e.date === currentDate ? { ...e, ...patch, updatedAt: now } : e
          )
        );
      } else {
        const newEntry: JournalEntry = {
          id: uuid(),
          date: currentDate,
          content: '',
          mood: 3,
          tags: [],
          createdAt: now,
          updatedAt: now,
          ...patch,
        };
        persist([newEntry, ...entries]);
      }
    },
    [entries, currentDate, persist]
  );

  const streak = (() => {
    let count = 0;
    const d = new Date(today);
    for (let i = 0; i < 365; i++) {
      const iso = d.toISOString().slice(0, 10);
      if (entries.some((e) => e.date === iso)) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  })();

  const recentEntries = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Journal</h1>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Zap size={14} className="text-amber-400" />
            <span className="text-amber-400 font-semibold">{streak} day streak</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Date nav */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
            <button
              onClick={() => setCurrentDate(offsetDate(currentDate, -1))}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex-1 text-center">
              <p className="font-semibold text-white">{formatDate(currentDate)}</p>
              {isToday && <p className="text-xs text-emerald-400">Today</p>}
            </div>
            <button
              onClick={() => setCurrentDate(offsetDate(currentDate, 1))}
              disabled={isToday}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Mood */}
          {!isFuture && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-3 font-medium">How are you feeling?</p>
              <div className="flex gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => upsert({ mood: m.value })}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-lg border transition-colors ${
                      current?.mood === m.value
                        ? `${m.color} border-current bg-slate-800`
                        : 'border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-400'
                    }`}
                  >
                    {m.icon}
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col" style={{ minHeight: '320px' }}>
            {!isFuture ? (
              <>
                {isToday && !current?.content && (
                  <p className="px-5 pt-4 text-sm text-slate-600 italic">{prompt}</p>
                )}
                <textarea
                  value={current?.content ?? ''}
                  onChange={(e) => upsert({ content: e.target.value })}
                  placeholder={isToday ? 'Write your thoughts...' : 'No entry for this day.'}
                  className="flex-1 p-5 bg-transparent text-slate-200 placeholder-slate-700 focus:outline-none resize-none text-sm leading-relaxed"
                  style={{ minHeight: '280px' }}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
                You can only journal in the past or today.
              </div>
            )}
          </div>

          {current && (
            <p className="text-xs text-slate-600 text-right">
              Last saved {new Date(current.updatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Recent entries sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recent Entries</h2>
          {recentEntries.length === 0 ? (
            <p className="text-sm text-slate-600">Start writing to see your entries here.</p>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((e) => {
                const mood = MOODS.find((m) => m.value === e.mood);
                return (
                  <button
                    key={e.id}
                    onClick={() => setCurrentDate(e.date)}
                    className={`w-full text-left p-3 bg-slate-900 border rounded-xl transition-colors ${
                      e.date === currentDate
                        ? 'border-violet-600/40'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        {e.date === today ? 'Today' : formatDate(e.date)}
                      </span>
                      {mood && (
                        <span className={`text-xs ${mood.color}`}>{mood.label}</span>
                      )}
                    </div>
                    {e.content && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {e.content}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
