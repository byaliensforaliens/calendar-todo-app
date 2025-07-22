import { useState, useEffect } from 'react'
import type { Todo, ViewType } from './types'
import { Calendar } from './components/Calendar'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { Navigation } from './components/Navigation'
import { PomodoroTimer } from './components/PomodoroTimer'
import { GameStats } from './components/GameStats'
import { AchievementManager } from './components/AchievementNotification'
import { useGameification } from './hooks/useGameification'
import './App.css'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>('month')
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>()
  const [showTodoForm, setShowTodoForm] = useState(false)
  const [selectedTodoForPomodoro, setSelectedTodoForPomodoro] = useState<Todo | undefined>()

  // Initialize gamification
  const { 
    gameStats, 
    completeTask, 
    completePomodoroSession, 
    createTask, 
    clearNewAchievements 
  } = useGameification()

  useEffect(() => {
    const savedTodos = localStorage.getItem('calendar-todos')
    if (savedTodos) {
      const parsed = JSON.parse(savedTodos)
      setTodos(parsed.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      })))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('calendar-todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = (todoData: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo: Todo = {
      ...todoData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }
    setTodos(prev => [...prev, newTodo])
    setShowTodoForm(false)
    
    // Track task creation for gamification
    createTask()
  }

  const updateTodo = (todoData: Omit<Todo, 'id' | 'createdAt'>) => {
    if (!editingTodo) return
    
    const updatedTodo: Todo = {
      ...editingTodo,
      ...todoData
    }
    
    setTodos(prev => prev.map(todo => 
      todo.id === editingTodo.id ? updatedTodo : todo
    ))
    setEditingTodo(undefined)
  }

  const toggleTodoComplete = (id: string) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === id) {
        const updatedTodo = { ...todo, completed: !todo.completed }
        
        // Track task completion for gamification (only when completing, not uncompleting)
        if (!todo.completed && updatedTodo.completed) {
          completeTask()
        }
        
        return updatedTodo
      }
      return todo
    }))
  }

  const deleteTodo = (id: string) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      setTodos(prev => prev.filter(todo => todo.id !== id))
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setShowTodoForm(true)
  }

  const handleCancelEdit = () => {
    setEditingTodo(undefined)
    setShowTodoForm(false)
  }

  const handleSelectTodoForPomodoro = (todo: Todo) => {
    setSelectedTodoForPomodoro(todo)
  }

  const handlePomodoroComplete = (todoId: string) => {
    // Track Pomodoro completion for gamification
    completePomodoroSession()
    
    console.log(`Completed Pomodoro session for task: ${todoId}`)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Calendar & Tasks</h1>
        <Navigation
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          viewType={viewType}
          onViewTypeChange={setViewType}
        />
      </header>

      <main className="app-main">
        <div className="left-section">
          <div className="calendar-section">
            <Calendar
              todos={todos}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              viewType={viewType}
            />
          </div>
          
          <GameStats />
        </div>

        <div className="sidebar">
          <div className="todo-form-section">
            <button
              onClick={() => setShowTodoForm(!showTodoForm)}
              className="btn btn-primary add-todo-btn"
            >
              {showTodoForm ? 'Cancel' : 'Add New Task'}
            </button>
            
            {showTodoForm && (
              <TodoForm
                onSubmit={editingTodo ? updateTodo : addTodo}
                selectedDate={selectedDate}
                editingTodo={editingTodo}
                onCancel={handleCancelEdit}
              />
            )}
          </div>

          <TodoList
            todos={todos}
            onToggleComplete={toggleTodoComplete}
            onEdit={handleEditTodo}
            onDelete={deleteTodo}
            onSelectForPomodoro={handleSelectTodoForPomodoro}
            selectedDate={viewType === 'day' ? selectedDate : undefined}
            selectedTodoForPomodoro={selectedTodoForPomodoro}
          />

          <PomodoroTimer
            selectedTodo={selectedTodoForPomodoro}
            onPomodoroComplete={handlePomodoroComplete}
          />
        </div>
      </main>

      {/* Achievement notifications */}
      <AchievementManager
        achievements={gameStats.newAchievements}
        onClearAchievements={clearNewAchievements}
      />
    </div>
  )
}

export default App
