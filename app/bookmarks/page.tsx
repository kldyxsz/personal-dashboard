'use client';

import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Plus, Search, Trash2, ExternalLink, Tag, X, Bookmark as BookmarkIcon } from 'lucide-react';
import { getBookmarks, saveBookmarks } from '@/lib/store';
import { Bookmark } from '@/lib/types';
import { formatRelative, parseTags } from '@/lib/utils';

const CATEGORIES = ['Article', 'Video', 'Tool', 'Course', 'Book', 'Research', 'Other'];

const catColors: Record<string, string> = {
  Article: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Video: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Tool: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Course: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Book: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Research: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function AddBookmarkForm({ onAdd, onClose }: { onAdd: (b: Bookmark) => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [tags, setTags] = useState('');

  const submit = () => {
    if (!title.trim() || !url.trim()) return;
    onAdd({
      id: uuid(),
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      category,
      tags: parseTags(tags),
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Save Bookmark</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
            <X size={18} />
          </button>
        </div>

        <input
          autoFocus
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-violet-600 text-sm"
        />

        <input
          type="url"
          placeholder="URL (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-600 text-sm font-mono"
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
            <label className="text-xs text-slate-500 mb-1 block">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. react, ux"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 placeholder-slate-600 text-sm focus:outline-none focus:border-violet-600"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={submit}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Save
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

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setBookmarks(getBookmarks()); }, []);

  const persist = (updated: Bookmark[]) => { setBookmarks(updated); saveBookmarks(updated); };
  const addBookmark = (b: Bookmark) => persist([b, ...bookmarks]);
  const remove = (id: string) => persist(bookmarks.filter((b) => b.id !== id));

  const allTags = Array.from(new Set(bookmarks.flatMap((b) => b.tags)));
  const usedCats = Array.from(new Set(bookmarks.map((b) => b.category)));

  const filtered = bookmarks.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.url.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || b.category === catFilter;
    const matchTag = !tagFilter || b.tags.includes(tagFilter);
    return matchSearch && matchCat && matchTag;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {showForm && <AddBookmarkForm onAdd={addBookmark} onClose={() => setShowForm(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookmarks</h1>
          <p className="text-sm text-slate-500 mt-0.5">{bookmarks.length} saved resources</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Save Bookmark
        </button>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-600"
          />
        </div>

        {usedCats.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCatFilter('all')}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
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
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  catFilter === c ? catColors[c] : 'border-slate-700 text-slate-500 hover:text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {allTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  tagFilter === tag
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'border-slate-700 text-slate-500 hover:border-violet-600 hover:text-violet-400'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-600 space-y-3">
          <BookmarkIcon size={32} className="mx-auto text-slate-700" />
          <p>{bookmarks.length === 0 ? 'No bookmarks yet. Save your first resource!' : 'No bookmarks match your search.'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <BookmarkCard key={b.id} bookmark={b} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkCard({ bookmark: b, onDelete }: { bookmark: Bookmark; onDelete: (id: string) => void }) {
  const catStyle = catColors[b.category] ?? catColors.Other;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border inline-block mb-2 ${catStyle}`}>
            {b.category}
          </span>
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug">{b.title}</h3>
        </div>
        <button
          onClick={() => onDelete(b.id)}
          className="p-1.5 text-slate-600 hover:text-red-400 transition-colors shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {b.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{b.description}</p>
      )}

      {b.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {b.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-0.5 text-xs text-violet-400 bg-violet-600/10 px-1.5 py-0.5 rounded">
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-slate-600">{getDomain(b.url)}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">{formatRelative(b.createdAt)}</span>
          <a
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-500 hover:text-violet-400 transition-colors"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
