'use client';

import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Plus, Trash2, Calendar, ChevronDown, Check, Filter } from 'lucide-react';
import { getTasks, saveTasks } from '@/lib/store';
import { Task, Priority } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

const priorityStyles: Record<Priority, string> = {
  high: 'bg-red-500/10 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const priorityDot: Record<Priority, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400',
};

function AddTaskForm({ onAdd }: { onAdd: (t: Task) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [open, setOpen] = useState(false);

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      id: uuid(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      priority,
      dueDate: dueDate || null,
      tags: [],
      createdAt: new Date().toISOString(),
    });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-4 py-3 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors text-sm"
      >
        <Plus size={16} /> Add task
      </button>
    );
  }

  return (
    <div className="bg-slate-900 border border-violet-600/40 rounded-xl p-4 space-y-3">
      <input
        autoFocus
        type="text"
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        className="w-full bg-transparent text-white placeholder-slate-600 font-medium focus:outline-none"
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-transparent text-sm text-slate-400 placeholder-slate-700 focus:outline-none"
      />
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors capitalize ${
                priority === p ? priorityStyles[p] : 'border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar size={13} />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-transparent text-xs text-slate-400 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={submit}
          className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Add Task
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const persist = (updated: Task[]) => {
    setTasks(updated);
    saveTasks(updated);
  };

  const addTask = (t: Task) => persist([t, ...tasks]);

  const toggle = (id: string) => {
    persist(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const remove = (id: string) => persist(tasks.filter((t) => t.id !== id));

  const filtered = tasks
    .filter((t) => {
      if (filter === 'active') return !t.completed;
      if (filter === 'done') return t.completed;
      return true;
    })
    .filter((t) => priorityFilter === 'all' || t.priority === priorityFilter)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    });

  const counts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    done: tasks.filter((t) => t.completed).length,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tasks</h1>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500">{counts.done}/{counts.all} done</span>
        </div>
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
              {f} {counts[f] > 0 && <span className="opacity-60">{counts[f]}</span>}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Filter size={12} className="text-slate-500" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-400 focus:outline-none"
          >
            <option value="all">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add task */}
      <AddTaskForm onAdd={addTask} />

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-slate-600 py-12">
            {filter === 'done' ? 'No completed tasks yet.' : 'No tasks found.'}
          </p>
        )}
        {filtered.map((t) => (
          <TaskItem key={t.id} task={t} onToggle={toggle} onDelete={remove} />
        ))}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-slate-900 border rounded-xl transition-colors ${
        task.completed ? 'border-slate-800 opacity-60' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
            task.completed
              ? 'bg-violet-600 border-violet-600'
              : 'border-slate-600 hover:border-violet-500'
          }`}
        >
          {task.completed && <Check size={11} className="text-white" strokeWidth={3} />}
        </button>

        {/* Priority dot */}
        <div className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
            {task.title}
          </p>
          {task.dueDate && !task.completed && (
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(task.dueDate)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border capitalize ${priorityStyles[task.priority]}`}
          >
            {task.priority}
          </span>
          {task.description && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ChevronDown
                size={14}
                className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && task.description && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-sm text-slate-400 leading-relaxed pl-10">{task.description}</p>
        </div>
      )}
    </div>
  );
}
