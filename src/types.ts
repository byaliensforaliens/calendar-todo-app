export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  date: string; // YYYY-MM-DD format
  createdAt: Date;
}

export type ViewType = 'day' | 'week' | 'month';

// Re-export gamification types for convenience
export type * from './types/gamification';