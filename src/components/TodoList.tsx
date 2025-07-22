import type { Todo } from '../types';
import { formatDateForInput } from '../utils/dateUtils';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onSelectForPomodoro: (todo: Todo) => void;
  selectedDate?: Date;
  selectedTodoForPomodoro?: Todo;
}

export const TodoList = ({ todos, onToggleComplete, onEdit, onDelete, onSelectForPomodoro, selectedDate, selectedTodoForPomodoro }: TodoListProps) => {
  const filteredTodos = selectedDate
    ? todos.filter(todo => todo.date === formatDateForInput(selectedDate))
    : todos;

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // Incomplete todos first, then by date, then by creation time
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  if (sortedTodos.length === 0) {
    return (
      <div className="todo-list empty">
        <p>No tasks {selectedDate ? 'for this date' : 'yet'}. Create one above!</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      <h3>
        {selectedDate 
          ? `Tasks for ${selectedDate.toLocaleDateString()}`
          : 'All Tasks'
        } ({sortedTodos.length})
      </h3>
      
      <div className="todos">
        {sortedTodos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''} ${selectedTodoForPomodoro?.id === todo.id ? 'selected-for-pomodoro' : ''}`}>
            <div className="todo-content">
              <label className="todo-checkbox">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => onToggleComplete(todo.id)}
                />
                <span className="checkmark"></span>
              </label>
              
              <div className="todo-details">
                <h4 className="todo-title">{todo.title}</h4>
                {todo.description && (
                  <p className="todo-description">{todo.description}</p>
                )}
                <div className="todo-meta">
                  <span className="todo-date">
                    {new Date(todo.date).toLocaleDateString()}
                  </span>
                  <span className="todo-created">
                    Created: {new Date(todo.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="todo-actions">
              <button
                onClick={() => onSelectForPomodoro(todo)}
                className={`btn btn-icon ${selectedTodoForPomodoro?.id === todo.id ? 'btn-primary' : 'btn-success'}`}
                title={selectedTodoForPomodoro?.id === todo.id ? 'Selected for Pomodoro' : 'Use for Pomodoro'}
                disabled={todo.completed}
              >
                {selectedTodoForPomodoro?.id === todo.id ? '🎯' : '⏰'}
              </button>
              <button
                onClick={() => onEdit(todo)}
                className="btn btn-icon btn-edit"
                title="Edit todo"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="btn btn-icon btn-delete"
                title="Delete todo"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};