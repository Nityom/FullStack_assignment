import { useState, useEffect } from 'react';
import type { Task } from '../types/Task';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedTasks, setCachedTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem('tasks');
    if (cached) {
      setCachedTasks(JSON.parse(cached));
      setLoading(false);
    }

    // Then fetch from server
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/tasks');
      const data = await response.json();
      setTasks(data);
      // Update cache
      localStorage.setItem('tasks', JSON.stringify(data));
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks. Using cached data.');
      // If we have cached data, use it
      if (cachedTasks.length > 0) {
        setTasks(cachedTasks);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: 'DELETE',
      });
      setTasks(tasks.filter(task => task.id !== id));
      // Update cache
      localStorage.setItem('tasks', JSON.stringify(tasks.filter(task => task.id !== id)));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">{task.title}</h3>
            <p className="text-gray-600 mb-4">{task.description}</p>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold
                ${task.status === 'done' ? 'bg-green-100 text-green-800' :
                task.status === 'in progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'}`}>
                {task.status}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
