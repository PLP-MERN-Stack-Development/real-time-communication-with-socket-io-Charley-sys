import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import io from 'socket.io-client'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [user, setUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState(null)
  const [departments, setDepartments] = useState([]) // Add departments state

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('✅ Connected to backend')
      // Fetch departments when connected
      fetchDepartments()
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      // Use fallback departments if connection fails
      setDepartments(getFallbackDepartments())
    })

    setSocket(newSocket)

    // Check for stored user
    const storedUser = localStorage.getItem('hospitalUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    return () => newSocket.disconnect()
  }, [])

  // Function to fetch departments from backend
  const fetchDepartments = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      console.log('Fetching departments from:', `${API_URL}/api/departments`)
      
      const response = await fetch(`${API_URL}/api/departments`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Departments loaded:', data)
      setDepartments(Array.isArray(data) ? data : getFallbackDepartments())
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      // Use fallback departments if API fails
      setDepartments(getFallbackDepartments())
    }
  }

  // Fallback departments in case API is unavailable
  const getFallbackDepartments = () => {
    return [
      { id: 'emergency', name: 'Emergency Department', onlineCount: 0 },
      { id: 'cardiology', name: 'Cardiology', onlineCount: 0 },
      { id: 'neurology', name: 'Neurology', onlineCount: 0 },
      { id: 'pediatrics', name: 'Pediatrics', onlineCount: 0 },
      { id: 'surgery', name: 'Surgery', onlineCount: 0 },
      { id: 'radiology', name: 'Radiology', onlineCount: 0 },
      { id: 'lab', name: 'Laboratory', onlineCount: 0 },
      { id: 'pharmacy', name: 'Pharmacy', onlineCount: 0 },
      { id: 'administration', name: 'Administration', onlineCount: 0 }
    ]
  }

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('hospitalUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('hospitalUser')
    if (socket) socket.disconnect()
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : 
              <Login onLogin={handleLogin} departments={departments} /> /* Pass departments */
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
                  departments={departments} // Pass departments
                />
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App