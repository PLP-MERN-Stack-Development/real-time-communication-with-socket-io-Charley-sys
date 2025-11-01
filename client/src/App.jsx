import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import io from 'socket.io-client'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'

const socket = io('http://localhost:5000')

function App() {
  const [user, setUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to hospital server')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    // Load departments
    fetchDepartments()

    // Check for stored user session
    const storedUser = localStorage.getItem('hospitalUser')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      joinSocketRoom(userData)
    }

    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/departments')
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      // Fallback departments if API fails
      setDepartments([
        { id: 'emergency', name: 'Emergency Department', onlineCount: 0 },
        { id: 'cardiology', name: 'Cardiology', onlineCount: 0 },
        { id: 'neurology', name: 'Neurology', onlineCount: 0 },
        { id: 'pediatrics', name: 'Pediatrics', onlineCount: 0 },
        { id: 'surgery', name: 'Surgery', onlineCount: 0 },
        { id: 'radiology', name: 'Radiology', onlineCount: 0 },
        { id: 'lab', name: 'Laboratory', onlineCount: 0 },
        { id: 'pharmacy', name: 'Pharmacy', onlineCount: 0 },
        { id: 'administration', name: 'Administration', onlineCount: 0 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const joinSocketRoom = (userData) => {
    socket.emit('healthcare_join', {
      username: userData.username,
      displayName: userData.displayName,
      role: userData.role,
      department: userData.department
    })
  }

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('hospitalUser', JSON.stringify(userData))
    joinSocketRoom(userData)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('hospitalUser')
    socket.disconnect()
    socket.connect()
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1>🏥 Hospital Communication System</h1>
          <p>Loading departments...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} departments={departments} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <Dashboard 
                  user={user} 
                  socket={socket} 
                  onLogout={handleLogout} 
                  isConnected={isConnected}
                  departments={departments}
                />
              ) : <Navigate to="/login" />
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App