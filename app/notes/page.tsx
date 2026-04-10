'use client';

import { useEffect, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { Plus, Search, Star, Trash2, Tag, X, Pin } from 'lucide-react';
import { getNotes, saveNotes } from '@/lib/store';
import { Note } from '@/lib/types';
import { formatRelative, parseTags } from '@/lib/utils';

const EMPTY_NOTE = (): Note => ({
  id: uuid(),
  title: '',
  content: '',
  tags: [],
  pinned: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getNotes();
    setNotes(loaded);
    if (loaded.length > 0) setSelected(loaded[0]);
  }, []);

  const persist = useCallback((updated: Note[]) => {
    setNotes(updated);
    saveNotes(updated);
  }, []);

  const updateSelected = useCallback(
    (patch: Partial<Note>) => {
      if (!selected) return;
      const updated = { ...selected, ...patch, updatedAt: new Date().toISOString() };
      setSelected(updated);
      persist(notes.map((n) => (n.id === updated.id ? updated : n)));
    },
    [selected, notes, persist]
  );

  const createNote = () => {
    const n = EMPTY_NOTE();
    const updated = [n, ...notes];
    persist(updated);
    setSelected(n);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    persist(updated);
    if (selected?.id === id) {
      setSelected(updated[0] ?? null);
    }
  };

  const togglePin = (note: Note) => {
    const patch = { pinned: !note.pinned, updatedAt: new Date().toISOString() };
    const updated = notes.map((n) => (n.id === note.id ? { ...n, ...patch } : n));
    persist(updated);
    if (selected?.id === note.id) setSelected({ ...note, ...patch });
  };

  const addTag = () => {
    const tags = parseTags(tagInput);
    if (!tags.length || !selected) return;
    const merged = Array.from(new Set([...selected.tags, ...tags]));
    updateSelected({ tags: merged });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!selected) return;
    updateSelected({ tags: selected.tags.filter((t) => t !== tag) });
  };

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  const filtered = notes
    .filter((n) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      const matchTag = !filterTag || n.tags.includes(filterTag);
      return matchSearch && matchTag;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Notes</h1>
        <button
          onClick={createNote}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left panel */}
        <div className="w-72 flex flex-col gap-3 shrink-0">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-600"
            />
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                    filterTag === tag
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-violet-600 hover:text-violet-400'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Note list */}
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {filtered.length === 0 && (
              <p className="text-sm text-slate-600 text-center py-8">No notes found.</p>
            )}
            {filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => setSelected(n)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selected?.id === n.id
                    ? 'bg-violet-600/20 border border-violet-600/40'
                    : 'hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-sm font-medium text-slate-200 line-clamp-1">
                    {n.title || 'Untitled'}
                  </p>
                  {n.pinned && <Pin size={11} className="text-amber-400 mt-0.5 shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.content}</p>
                <p className="text-xs text-slate-600 mt-1">{formatRelative(n.updatedAt)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        {selected ? (
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col min-h-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <span className="text-xs text-slate-500">
                Edited {formatRelative(selected.updatedAt)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePin(selected)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    selected.pinned
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                  title={selected.pinned ? 'Unpin' : 'Pin'}
                >
                  <Star size={15} fill={selected.pinned ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => deleteNote(selected.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Title */}
            <input
              type="text"
              placeholder="Note title..."
              value={selected.title}
              onChange={(e) => updateSelected({ title: e.target.value })}
              className="px-5 pt-5 pb-2 bg-transparent text-xl font-bold text-white placeholder-slate-700 focus:outline-none"
            />

            {/* Tags */}
            <div className="px-5 pb-3 flex flex-wrap items-center gap-2">
              {selected.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs bg-violet-600/20 text-violet-400 px-2 py-0.5 rounded-full border border-violet-600/30"
                >
                  <Tag size={10} />
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-white ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  className="bg-transparent text-xs text-slate-400 placeholder-slate-700 focus:outline-none w-20"
                />
                {tagInput && (
                  <button onClick={addTag} className="text-xs text-violet-400 hover:text-violet-300">
                    add
                  </button>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-800 mx-5" />

            {/* Content */}
            <textarea
              placeholder="Start writing..."
              value={selected.content}
              onChange={(e) => updateSelected({ content: e.target.value })}
              className="flex-1 px-5 py-4 bg-transparent text-slate-200 placeholder-slate-700 focus:outline-none resize-none text-sm leading-relaxed font-mono"
            />
          </div>
        ) : (
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-500 mb-3">No note selected</p>
              <button
                onClick={createNote}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors mx-auto"
              >
                <Plus size={16} /> Create a note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
