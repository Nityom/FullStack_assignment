import { useState, useEffect } from 'react'
import './App.css'
import TaskList from './components/TaskList'
import TaskForm from './components/TaskForm'
import TaskSearch from './components/TaskSearch'
import type { Task } from './types/Task.js'

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Task[] | null>(null);

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem('tasks');
    if (cached) {
      setTasks(JSON.parse(cached));
    }
    // Then fetch from server
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // For browser connections, always use localhost
      const apiUrl = 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/tasks`);
      const data = await response.json();
      setTasks(data);
      // Update cache
      localStorage.setItem('tasks', JSON.stringify(data));
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  };

  const handleTaskAdded = async (newTask: Task) => {
    try {
      // For browser connections, always use localhost
      const apiUrl = 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      
      if (!response.ok) throw new Error('Failed to create task');
      
      const createdTask = await response.json();
      setTasks(prevTasks => [...prevTasks, createdTask]);
      localStorage.setItem('tasks', JSON.stringify([...tasks, createdTask]));
      setSearchResults(null); // Clear search results when adding a new task
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleTaskDelete = async (id: number) => {
    try {
      // For browser connections, always use localhost
      const apiUrl = 'http://localhost:3000';
      await fetch(`${apiUrl}/api/tasks/${id}`, {
        method: 'DELETE',
      });
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      if (searchResults) {
        setSearchResults(searchResults.filter(task => task.id !== id));
      }
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleSearchResults = (results: Task[]) => {
    setSearchResults(results);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">Task Manager</h1>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <TaskForm onTaskAdded={handleTaskAdded} />
        <div className="mt-8">
          <TaskSearch onSearchResults={handleSearchResults} />
          {searchResults && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Search Results</h2>
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear Search
                </button>
              </div>
              <TaskList tasks={searchResults} onDeleteTask={handleTaskDelete} />
            </div>
          )}
          {!searchResults && (
            <TaskList tasks={tasks} onDeleteTask={handleTaskDelete} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
