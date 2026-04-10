'use client';

import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Plus, Trash2, Check, ChevronDown, Trophy, Calendar, X } from 'lucide-react';
import { getGoals, saveGoals } from '@/lib/store';
import { Goal, Milestone } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const CATEGORIES = ['Health', 'Career', 'Learning', 'Finance', 'Relationships', 'Creativity', 'Other'];

const categoryColors: Record<string, string> = {
  Health: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Career: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Learning: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Finance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Relationships: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Creativity: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

function NewGoalModal({ onAdd, onClose }: { onAdd: (g: Goal) => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [targetDate, setTargetDate] = useState('');
  const [milestones, setMilestones] = useState<string[]>(['']);

  const submit = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onAdd({
      id: uuid(),
      title: title.trim(),
      description: description.trim(),
      category,
      targetDate: targetDate || null,
      progress: 0,
      milestones: milestones
        .filter((m) => m.trim())
        .map((m) => ({ id: uuid(), title: m.trim(), completed: false })),
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New Goal</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
            <X size={18} />
          </button>
        </div>

        <input
          autoFocus
          type="text"
          placeholder="Goal title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-violet-600 text-sm"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-600 text-sm resize-none"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-violet-600"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-violet-600"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-2 block">Milestones</label>
          <div className="space-y-2">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Milestone ${i + 1}`}
                  value={m}
                  onChange={(e) => {
                    const next = [...milestones];
                    next[i] = e.target.value;
                    setMilestones(next);
                  }}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-600"
                />
                {milestones.length > 1 && (
                  <button
                    onClick={() => setMilestones(milestones.filter((_, j) => j !== i))}
                    className="text-slate-600 hover:text-red-400 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setMilestones([...milestones, ''])}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              <Plus size={12} /> Add milestone
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={submit}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create Goal
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ goal, onUpdate, onDelete }: {
  goal: Goal;
  onUpdate: (g: Goal) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const toggleMilestone = (mId: string) => {
    const milestones = goal.milestones.map((m) =>
      m.id === mId ? { ...m, completed: !m.completed } : m
    );
    const done = milestones.filter((m) => m.completed).length;
    const progress = milestones.length > 0 ? Math.round((done / milestones.length) * 100) : goal.progress;
    onUpdate({ ...goal, milestones, progress, updatedAt: new Date().toISOString() });
  };

  const setProgress = (value: number) => {
    onUpdate({ ...goal, progress: value, updatedAt: new Date().toISOString() });
  };

  const markComplete = () => {
    onUpdate({ ...goal, completed: !goal.completed, progress: !goal.completed ? 100 : goal.progress, updatedAt: new Date().toISOString() });
  };

  const catStyle = categoryColors[goal.category] ?? categoryColors.Other;

  return (
    <div className={`bg-slate-900 border rounded-xl transition-colors ${goal.completed ? 'border-slate-800 opacity-75' : 'border-slate-800 hover:border-slate-700'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${catStyle}`}>
                {goal.category}
              </span>
              {goal.completed && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Trophy size={11} /> Completed
                </span>
              )}
            </div>
            <h3 className={`font-semibold ${goal.completed ? 'line-through text-slate-500' : 'text-white'}`}>
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{goal.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={markComplete}
              className={`p-1.5 rounded-lg transition-colors ${goal.completed ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'}`}
              title={goal.completed ? 'Reopen' : 'Mark complete'}
            >
              <Check size={15} />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500">Progress</span>
            <span className="text-xs text-slate-400 font-medium">{goal.progress}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
          {goal.milestones.length === 0 && (
            <input
              type="range"
              min={0}
              max={100}
              value={goal.progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full mt-2 accent-violet-500"
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          {goal.targetDate ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={12} />
              {formatDate(goal.targetDate)}
            </div>
          ) : <div />}
          {goal.milestones.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length} milestones
              <ChevronDown
                size={13}
                className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
      </div>

      {expanded && goal.milestones.length > 0 && (
        <div className="border-t border-slate-800 px-5 py-4 space-y-2">
          {goal.milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <button
                onClick={() => toggleMilestone(m.id)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  m.completed ? 'bg-violet-600 border-violet-600' : 'border-slate-600 hover:border-violet-500'
                }`}
              >
                {m.completed && <Check size={9} className="text-white" strokeWidth={3} />}
              </button>
              <span className={`text-sm ${m.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                {m.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [catFilter, setCatFilter] = useState<string>('all');

  useEffect(() => { setGoals(getGoals()); }, []);

  const persist = (updated: Goal[]) => { setGoals(updated); saveGoals(updated); };
  const addGoal = (g: Goal) => persist([g, ...goals]);
  const updateGoal = (g: Goal) => persist(goals.map((x) => (x.id === g.id ? g : x)));
  const deleteGoal = (id: string) => persist(goals.filter((g) => g.id !== id));

  const usedCats = Array.from(new Set(goals.map((g) => g.category)));

  const filtered = goals
    .filter((g) => {
      if (filter === 'active') return !g.completed;
      if (filter === 'done') return g.completed;
      return true;
    })
    .filter((g) => catFilter === 'all' || g.category === catFilter);

  const active = goals.filter((g) => !g.completed);
  const done = goals.filter((g) => g.completed);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {showModal && (
        <NewGoalModal onAdd={addGoal} onClose={() => setShowModal(false)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals</h1>
          <p className="text-sm text-slate-500 mt-0.5">{active.length} active · {done.length} completed</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
          {(['all', 'active', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {usedCats.length > 1 && (
          <div className="flex gap-1.5">
            <button
              onClick={() => setCatFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                catFilter === 'all'
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              All
            </button>
            {usedCats.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(catFilter === c ? 'all' : c)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  catFilter === c
                    ? `${categoryColors[c]}`
                    : 'border-slate-700 text-slate-500 hover:text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 text-center py-16 text-slate-600">
            {goals.length === 0 ? (
              <div className="space-y-3">
                <Trophy size={32} className="mx-auto text-slate-700" />
                <p>No goals yet. Set your first goal!</p>
              </div>
            ) : (
              <p>No goals match the current filter.</p>
            )}
          </div>
        ) : (
          filtered.map((g) => (
            <GoalCard key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} />
          ))
        )}
      </div>
    </div>
  );
}
