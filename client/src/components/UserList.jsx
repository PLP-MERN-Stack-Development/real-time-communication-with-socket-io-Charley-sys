import React from 'react';

const UserList = ({ departmentUsers, allUsers, currentUser, onUserSelect }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    const colors = {
      doctor: '#3498db',
      nurse: '#9b59b6',
      technician: '#e67e22',
      admin: '#e74c3c'
    };
    return colors[role] || '#95a5a6';
  };

  return (
    <div className="user-list">
      <h3>Online in Department ({departmentUsers.length})</h3>
      <div className="users-container">
        {departmentUsers.map(user => (
          <div 
            key={user.id}
            className="user-item"
            onClick={() => onUserSelect(user)}
          >
            <div 
              className="user-avatar"
              style={{ backgroundColor: getRoleColor(user.role) }}
            >
              {getInitials(user.displayName)}
            </div>
            <div className="user-info-small">
              <div className="user-name">{user.displayName}</div>
              <div className="user-details">
                {user.role} • {user.department}
              </div>
            </div>
            <div className="user-status-dot online"></div>
          </div>
        ))}
        
        {departmentUsers.length === 0 && (
          <div className="no-users">No users online in your department</div>
        )}
      </div>

      <h3 style={{ marginTop: '20px' }}>All Staff ({allUsers.length})</h3>
      <div className="users-container">
        {allUsers.map(user => (
          <div 
            key={user.id}
            className={`user-item ${user.id === currentUser.id ? 'current-user' : ''}`}
            onClick={() => onUserSelect(user)}
          >
            <div 
              className="user-avatar"
              style={{ backgroundColor: getRoleColor(user.role) }}
            >
              {getInitials(user.displayName)}
            </div>
            <div className="user-info-small">
              <div className="user-name">
                {user.displayName} 
                {user.id === currentUser.id && ' (You)'}
              </div>
              <div className="user-details">
                {user.role} • {user.department}
              </div>
            </div>
            <div className={`user-status-dot ${user.isOnline ? 'online' : 'offline'}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;