import React, { useEffect, useState } from 'react';
import './App.css';
import UserList from './components/UserList';
import { getUsers, User } from './services/api';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Make sure the backend is running.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Frontend Backend Project</h1>
        <p>A full-stack application with React and Node.js</p>
      </header>
      <main className="App-main">
        {loading && <p>Loading users...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && <UserList users={users} onRefresh={fetchUsers} />}
      </main>
    </div>
  );
}

export default App;
