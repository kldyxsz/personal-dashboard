'use client';

import { Note, Task, JournalEntry, Goal, Bookmark } from './types';

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Notes
export const getNotes = (): Note[] => getItem<Note[]>('brain_notes', []);
export const saveNotes = (notes: Note[]) => setItem('brain_notes', notes);

// Tasks
export const getTasks = (): Task[] => getItem<Task[]>('brain_tasks', []);
export const saveTasks = (tasks: Task[]) => setItem('brain_tasks', tasks);

// Journal
export const getJournalEntries = (): JournalEntry[] =>
  getItem<JournalEntry[]>('brain_journal', []);
export const saveJournalEntries = (entries: JournalEntry[]) =>
  setItem('brain_journal', entries);

// Goals
export const getGoals = (): Goal[] => getItem<Goal[]>('brain_goals', []);
export const saveGoals = (goals: Goal[]) => setItem('brain_goals', goals);

// Bookmarks
export const getBookmarks = (): Bookmark[] =>
  getItem<Bookmark[]>('brain_bookmarks', []);
export const saveBookmarks = (bookmarks: Bookmark[]) =>
  setItem('brain_bookmarks', bookmarks);
