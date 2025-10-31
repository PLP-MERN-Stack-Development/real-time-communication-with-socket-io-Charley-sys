import React, { useState, useEffect, useRef } from 'react'

const DepartmentChat = ({ socket, user }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    socket.on('receive_department_message', (message) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('department_user_joined', (data) => {
      const systemMessage = {
        id: Date.now(),
        sender: 'System',
        content: `${data.user} (${data.role}) joined the department`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }
      setMessages(prev => [...prev, systemMessage])
    })

    socket.on('department_user_left', (data) => {
      const systemMessage = {
        id: Date.now(),
        sender: 'System',
        content: `${data.user} left the department`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }
      setMessages(prev => [...prev, systemMessage])
    })

    return () => {
      socket.off('receive_department_message')
      socket.off('department_user_joined')
      socket.off('department_user_left')
    }
  }, [socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      socket.emit('send_department_message', {
        content: newMessage
      })
      setNewMessage('')
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="department-chat">
      <div className="chat-header">
        <h3>{user.department.charAt(0).toUpperCase() + user.department.slice(1)} Department</h3>
        <span className="chat-info">Real-time department communication</span>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.isSystem ? 'system-message' : ''} ${
              message.senderId === socket.id ? 'own-message' : ''
            }`}
          >
            {!message.isSystem && (
              <div className="message-header">
                <strong className="sender-name">{message.sender}</strong>
                <span className="sender-role">{message.senderRole}</span>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
            )}
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${user.department} department...`}
          maxLength={500}
        />
        <button type="submit" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}

export default DepartmentChat