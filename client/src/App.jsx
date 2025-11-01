import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import io from 'socket.io-client'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'

// Dynamic socket URL based on environment
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [user, setUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    console.log('Connecting to socket:', SOCKET_URL)
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('✅ Connected to hospital server')
    })

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false)
      console.log('❌ Disconnected from hospital server:', reason)
    })

    newSocket.on('connect_error', (error) => {
      console.error('🚨 Connection error:', error)
      setIsConnected(false)
    })

    newSocket.on('error', (error) => {
      console.error('🚨 Socket error:', error)
    })

    setSocket(newSocket)

    // Load departments
    fetchDepartments()

    // Check for stored user session
    const storedUser = localStorage.getItem('hospitalUser')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        joinSocketRoom(newSocket, userData)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('hospitalUser')
      }
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_URL}/api/departments`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
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

  const joinSocketRoom = (socketInstance, userData) => {
    if (socketInstance && userData) {
      socketInstance.emit('healthcare_join', {
        username: userData.username,
        displayName: userData.displayName,
        role: userData.role,
        department: userData.department
      })
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('hospitalUser', JSON.stringify(userData))
    if (socket) {
      joinSocketRoom(socket, userData)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('hospitalUser')
    if (socket) {
      socket.disconnect()
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1>🏥 Hospital Communication System</h1>
          <div className="loading-spinner"></div>
          <p>Loading departments...</p>
          <p className="loading-subtitle">Connecting to: {SOCKET_URL}</p>
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
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App