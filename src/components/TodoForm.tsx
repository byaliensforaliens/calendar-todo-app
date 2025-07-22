import { useState } from 'react';
import type { Todo } from '../types';
import { formatDateForInput } from '../utils/dateUtils';

interface TodoFormProps {
  onSubmit: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
  selectedDate: Date;
  editingTodo?: Todo;
  onCancel?: () => void;
}

export const TodoForm = ({ onSubmit, selectedDate, editingTodo, onCancel }: TodoFormProps) => {
  const [title, setTitle] = useState(editingTodo?.title || '');
  const [description, setDescription] = useState(editingTodo?.description || '');
  const [date, setDate] = useState(
    editingTodo?.date || formatDateForInput(selectedDate)
  );
  const [completed, setCompleted] = useState(editingTodo?.completed || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      completed,
    });

    if (!editingTodo) {
      setTitle('');
      setDescription('');
      setCompleted(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <h3>{editingTodo ? 'Edit Task' : 'Create New Task'}</h3>
      
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {editingTodo && (
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            Completed
          </label>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {editingTodo ? 'Update Task' : 'Create Task'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};