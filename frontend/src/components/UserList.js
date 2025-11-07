import React from 'react';
import './UserList.css';

function UserList({ users, onRefresh }) {
  return (
    <div className="user-list">
      <div className="user-list-header">
        <h2>Users</h2>
        <button onClick={onRefresh} className="refresh-btn">
          Refresh
        </button>
      </div>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="user-cards">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <span className="user-id">ID: {user.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserList;
