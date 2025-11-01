import React, { useState, useEffect } from 'react'
import DepartmentChat from './DepartmentChat'
import PrivateChat from './PrivateChat'
import EmergencyAlert from './EmergencyAlert'
import UserList from './UserList'

const Dashboard = ({ user, socket, onLogout, isConnected, departments }) => {
  const [activeTab, setActiveTab] = useState('department')
  const [departmentUsers, setDepartmentUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [emergencyAlerts, setEmergencyAlerts] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState(user.department) // Default to user's department

  useEffect(() => {
    // Join user's department room
    socket.emit('healthcare_join', {
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      department: user.department
    })

    // Listen for department users updates
    socket.on('department_users_update', (users) => {
      setDepartmentUsers(users)
    })

    // Listen for emergency alerts
    socket.on('emergency_alert', (alert) => {
      setEmergencyAlerts(prev => [alert, ...prev])
      // Auto-remove alert after 30 seconds
      setTimeout(() => {
        setEmergencyAlerts(prev => prev.filter(a => a.id !== alert.id))
      }, 30000)
    })

    // Load all users
    fetchAllUsers()

    return () => {
      socket.off('department_users_update')
      socket.off('emergency_alert')
    }
  }, [socket, user])

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users')
      const users = await response.json()
      setAllUsers(users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleDepartmentChange = (deptId) => {
    setSelectedDepartment(deptId)
    // Join the new department room for listening
    socket.emit('join-room', deptId)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-info">
          <h1>🏥 Hospital Communication System</h1>
          <div className="user-status">
            <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <span className="user-info">
              {user.displayName} ({user.role}) - {user.department}
            </span>
          </div>
        </div>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <EmergencyAlert 
        socket={socket} 
        user={user}
        alerts={emergencyAlerts}
      />

      <div className="dashboard-content">
        <aside className="sidebar">
          <div className="department-selector">
            <h3>Select Department</h3>
            <div className="department-buttons">
              {departments.map(dept => (
                <button
                  key={dept.id}
                  className={`dept-btn ${selectedDepartment === dept.id ? 'active' : ''}`}
                  onClick={() => handleDepartmentChange(dept.id)}
                >
                  <span className="dept-name">{dept.name}</span>
                  <span className="online-count">{dept.onlineCount || 0}</span>
                </button>
              ))}
            </div>
          </div>
          
          <UserList 
            departmentUsers={departmentUsers}
            allUsers={allUsers}
            currentUser={user}
            onUserSelect={(user) => setActiveTab(`private-${user.id}`)}
          />
        </aside>

        <main className="main-content">
          <nav className="content-tabs">
            <button 
              className={activeTab === 'department' ? 'active' : ''}
              onClick={() => setActiveTab('department')}
            >
              {selectedDepartment.charAt(0).toUpperCase() + selectedDepartment.slice(1)} Department Chat
            </button>
            <button 
              className={activeTab === 'private' ? 'active' : ''}
              onClick={() => setActiveTab('private')}
            >
              Private Messages
            </button>
          </nav>

          <div className="content-area">
            {activeTab === 'department' && (
              <DepartmentChat 
                socket={socket} 
                user={user} 
                department={selectedDepartment} 
              />
            )}
            {activeTab === 'private' && (
              <PrivateChat socket={socket} user={user} allUsers={allUsers} />
            )}
            {activeTab.startsWith('private-') && (
              <PrivateChat 
                socket={socket} 
                user={user} 
                allUsers={allUsers}
                selectedUserId={activeTab.split('-')[1]}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard