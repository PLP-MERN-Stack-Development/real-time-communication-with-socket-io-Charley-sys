import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:5000')

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to hospital server')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('receive_department_message', (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('receive_department_message')
    }
  }, [])

  const joinAsStaff = () => {
    const userData = {
      username: 'demo_user',
      displayName: 'Demo Staff',
      role: 'doctor',
      department: 'emergency'
    }
    setUser(userData)
    socket.emit('healthcare_join', userData)
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim() && user) {
      socket.emit('send_department_message', {
        content: newMessage
      })
      setNewMessage('')
    }
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🏥 Hospital Communication System</h1>
        <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
        <button onClick={joinAsStaff} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Join as Demo Staff
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🏥 Hospital Communication System</h1>
        <div>
          <span style={{ color: isConnected ? 'green' : 'red', marginRight: '20px' }}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <span>Welcome, {user.displayName} ({user.role})</span>
        </div>
      </header>

      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <h3>Emergency Department Chat</h3>
        
        <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <strong>{msg.sender}</strong> ({msg.senderRole}): {msg.content}
              <div style={{ fontSize: '12px', color: '#666' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{ flex: 1, padding: '8px', fontSize: '16px' }}
          />
          <button type="submit" style={{ padding: '8px 16px', fontSize: '16px' }}>
            Send
          </button>
        </form>
      </div>

      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px' }}>
        <h3>Emergency Alert</h3>
        <button 
          onClick={() => {
            socket.emit('send_emergency_alert', {
              title: 'Emergency Situation',
              description: 'Immediate assistance required in Emergency Department'
            })
          }}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#ff4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🚨 Send Emergency Alert
        </button>
      </div>
    </div>
  )
}

export default App