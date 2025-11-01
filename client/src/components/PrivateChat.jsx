import React, { useState, useEffect, useRef } from 'react';

const PrivateChat = ({ socket, user, allUsers, selectedUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize or reset when selectedUserId changes
  useEffect(() => {
    if (selectedUserId && allUsers.length > 0) {
      const foundUser = allUsers.find(u => u.id === selectedUserId);
      setSelectedUser(foundUser);
      setMessages([]); // Clear messages when switching users
      setIsLoading(false);
    } else {
      setSelectedUser(null);
      setMessages([]);
    }
  }, [selectedUserId, allUsers]);

  // Socket event listeners for private messages
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleReceivePrivateMessage = (message) => {
      // Check if message is between current user and selected user
      if (
        (message.fromId === selectedUser.id && message.toId === socket.id) ||
        (message.toId === selectedUser.id && message.fromId === socket.id)
      ) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(msg => msg.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    // Listen for private messages
    socket.on('receive_private_message', handleReceivePrivateMessage);

    // Cleanup
    return () => {
      socket.off('receive_private_message', handleReceivePrivateMessage);
    };
  }, [socket, selectedUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'nearest'
    });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      toUserId: selectedUser.id,
      content: newMessage.trim()
    };

    // Create temporary message for immediate UI update
    const tempMessage = {
      id: `temp-${Date.now()}`,
      from: user.displayName,
      fromId: socket.id,
      to: selectedUser.displayName,
      toId: selectedUser.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isTemp: true,
      status: 'sending'
    };

    // Add temporary message to UI immediately
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    // Emit the message via socket
    socket.emit('send_private_message', messageData);

    // Update message status after a short delay (simulating send completion)
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, isTemp: false, status: 'sent' }
            : msg
        )
      );
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.fromId === socket.id;
    
    return (
      <div 
        key={message.id} 
        className={`private-message ${isOwnMessage ? 'own-message' : 'other-message'} ${
          message.isTemp ? 'temp-message' : ''
        }`}
      >
        <div className="message-content-wrapper">
          {!isOwnMessage && (
            <div className="message-sender">
              {selectedUser?.displayName}
            </div>
          )}
          <div className="message-bubble">
            <div className="message-text">{message.content}</div>
            <div className="message-meta">
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
              {isOwnMessage && (
                <span className="message-status">
                  {message.isTemp ? '🕐' : '✓'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render when no user is selected
  if (!selectedUser) {
    return (
      <div className="private-chat">
        <div className="no-chat-selected">
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>Private Messages</h3>
            <p>Select a healthcare professional from the sidebar to start a private conversation</p>
            <div className="empty-features">
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <span>Secure end-to-end messaging</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>Real-time delivery</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🏥</span>
                <span>Healthcare professional network</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="private-chat">
      {/* Chat Header */}
      <div className="private-chat-header">
        <div className="chat-partner-info">
          <div 
            className="partner-avatar"
            style={{ 
              backgroundColor: getRoleColor(selectedUser.role),
              color: 'white'
            }}
          >
            {getInitials(selectedUser.displayName)}
          </div>
          <div className="partner-details">
            <h3>{selectedUser.displayName}</h3>
            <div className="partner-meta">
              <span className="partner-role">{selectedUser.role}</span>
              <span className="partner-department">{selectedUser.department}</span>
              <span className={`partner-status ${selectedUser.isOnline ? 'online' : 'offline'}`}>
                {selectedUser.isOnline ? '🟢 Online' : '⚫ Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn" title="Call">
            📞
          </button>
          <button className="action-btn" title="Video Call">
            📹
          </button>
          <button className="action-btn" title="More options">
            ⋮
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="private-messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="empty-chat">
              <div className="empty-chat-icon">👋</div>
              <h4>Start a conversation</h4>
              <p>Send your first message to {selectedUser.displayName}</p>
              <div className="conversation-starters">
                <button 
                  className="starter-btn"
                  onClick={() => setNewMessage(`Hello ${selectedUser.displayName}, how are you doing today?`)}
                >
                  "Hello, how are you doing today?"
                </button>
                <button 
                  className="starter-btn"
                  onClick={() => setNewMessage(`Hi ${selectedUser.displayName}, I need to discuss a patient case with you.`)}
                >
                  "I need to discuss a patient case"
                </button>
                <button 
                  className="starter-btn"
                  onClick={() => setNewMessage(`Hello ${selectedUser.displayName}, are you available for a quick meeting?`)}
                >
                  "Are you available for a meeting?"
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-scroll-area">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date} className="message-date-group">
                <div className="date-divider">
                  <span>{formatDate(dateMessages[0].timestamp)}</span>
                </div>
                {dateMessages.map(renderMessage)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="private-message-form">
        <div className="message-input-wrapper">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${selectedUser.displayName}...`}
            maxLength={1000}
            disabled={!selectedUser.isOnline}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || !selectedUser.isOnline}
            className="send-button"
            title={!selectedUser.isOnline ? "User is offline" : "Send message"}
          >
            {!selectedUser.isOnline ? '⚫' : '📤'}
          </button>
        </div>
        {!selectedUser.isOnline && (
          <div className="offline-notice">
            ⚫ {selectedUser.displayName} is currently offline. Messages will be delivered when they come online.
          </div>
        )}
        <div className="input-hint">
          Press Enter to send • Shift + Enter for new line
        </div>
      </form>
    </div>
  );
};

// Helper functions
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

export default PrivateChat;