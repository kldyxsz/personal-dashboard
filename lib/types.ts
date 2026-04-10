export type Priority = 'low' | 'medium' | 'high';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: string | null;
  progress: number; // 0-100
  milestones: Milestone[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  category: string;
  createdAt: string;
}
