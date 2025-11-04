import React, { useState, useEffect } from 'react'
import DepartmentChat from './DepartmentChat'
import PrivateChat from './PrivateChat'
import EmergencyAlert from './EmergencyAlert'
import UserList from './UserList'

const Dashboard = ({ user, socket, onLogout, isConnected, departments = [] }) => {
  const [activeTab, setActiveTab] = useState('department')
  const [departmentUsers, setDepartmentUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [emergencyAlerts, setEmergencyAlerts] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState(user?.department || 'emergency')

  useEffect(() => {
    if (!socket || !user) return

    // Join user's department room
    socket.emit('healthcare_join', {
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      department: user.department
    })

    // Listen for department users updates
    socket.on('department_users_update', (users) => {
      setDepartmentUsers(Array.isArray(users) ? users : [])
    })

    // Listen for emergency alerts
    socket.on('emergency_alert', (alert) => {
      setEmergencyAlerts(prev => [alert, ...prev].slice(0, 5)) // Keep only 5 latest
    })

    return () => {
      socket.off('department_users_update')
      socket.off('emergency_alert')
    }
  }, [socket, user])

  const handleDepartmentChange = (deptId) => {
    setSelectedDepartment(deptId)
    socket.emit('join-room', deptId)
  }

  // Safe department list
  const safeDepartments = Array.isArray(departments) ? departments : []

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
              {user?.displayName || 'User'} ({user?.role || 'staff'}) - {user?.department || 'emergency'}
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
              {safeDepartments.length > 0 ? (
                safeDepartments.map(dept => (
                  <button
                    key={dept.id || dept}
                    className={`dept-btn ${selectedDepartment === (dept.id || dept) ? 'active' : ''}`}
                    onClick={() => handleDepartmentChange(dept.id || dept)}
                  >
                    <span className="dept-name">{dept.name || dept}</span>
                    <span className="online-count">{dept.onlineCount || 0}</span>
                  </button>
                ))
              ) : (
                <div className="no-departments">
                  <p>No departments available</p>
                </div>
              )}
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
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard