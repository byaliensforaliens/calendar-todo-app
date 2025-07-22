import type { Todo, ViewType } from '../types';
import { formatDateForInput } from '../utils/dateUtils';

interface CalendarProps {
  todos: Todo[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  viewType: ViewType;
}

export const Calendar = ({ todos, selectedDate, onDateSelect, viewType }: CalendarProps) => {
  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTodosForDate = (date: Date) => {
    const dateStr = formatDateForInput(date);
    return todos.filter(todo => todo.date === dateStr);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayTodos = getTodosForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => onDateSelect(date)}
        >
          <div className="day-number">{day}</div>
          {dayTodos.length > 0 && (
            <div className="todo-indicators">
              {dayTodos.slice(0, 3).map(todo => (
                <div
                  key={todo.id}
                  className={`todo-indicator ${todo.completed ? 'completed' : ''}`}
                  title={todo.title}
                />
              ))}
              {dayTodos.length > 3 && (
                <div className="todo-indicator more">+{dayTodos.length - 3}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="calendar-grid">
        <div className="calendar-header">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
        </div>
        <div className="calendar-body">
          {days}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(selectedDate.getDate() - day);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayTodos = getTodosForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      weekDays.push(
        <div
          key={i}
          className={`week-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => onDateSelect(date)}
        >
          <div className="week-day-header">
            <div className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="day-number">{date.getDate()}</div>
          </div>
          <div className="week-day-todos">
            {dayTodos.map(todo => (
              <div key={todo.id} className={`week-todo ${todo.completed ? 'completed' : ''}`}>
                {todo.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div className="week-view">{weekDays}</div>;
  };

  const renderDayView = () => {
    const dayTodos = getTodosForDate(selectedDate);
    
    return (
      <div className="day-view">
        <h2>{selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</h2>
        <div className="day-todos">
          {dayTodos.map(todo => (
            <div key={todo.id} className={`day-todo ${todo.completed ? 'completed' : ''}`}>
              <h3>{todo.title}</h3>
              {todo.description && <p>{todo.description}</p>}
            </div>
          ))}
          {dayTodos.length === 0 && (
            <p className="no-todos">No todos for this day</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar">
      {viewType === 'month' && renderMonthView()}
      {viewType === 'week' && renderWeekView()}
      {viewType === 'day' && renderDayView()}
    </div>
  );
};