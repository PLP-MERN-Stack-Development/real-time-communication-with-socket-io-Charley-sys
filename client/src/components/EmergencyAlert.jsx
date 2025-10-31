import React, { useState } from 'react'

const EmergencyAlert = ({ socket, user, alerts }) => {
  const [showEmergencyForm, setShowEmergencyForm] = useState(false)
  const [emergencyData, setEmergencyData] = useState({
    title: '',
    description: ''
  })

  const sendEmergencyAlert = (e) => {
    e.preventDefault()
    if (emergencyData.title.trim() && emergencyData.description.trim()) {
      socket.emit('send_emergency_alert', emergencyData)
      setEmergencyData({ title: '', description: '' })
      setShowEmergencyForm(false)
    }
  }

  return (
    <div className="emergency-section">
      <button 
        className="emergency-btn"
        onClick={() => setShowEmergencyForm(!showEmergencyForm)}
      >
        🚨 Emergency Alert
      </button>

      {showEmergencyForm && (
        <div className="emergency-modal">
          <div className="emergency-form">
            <h3>🚨 Send Emergency Alert</h3>
            <form onSubmit={sendEmergencyAlert}>
              <input
                type="text"
                placeholder="Alert Title"
                value={emergencyData.title}
                onChange={(e) => setEmergencyData({...emergencyData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Emergency Description"
                value={emergencyData.description}
                onChange={(e) => setEmergencyData({...emergencyData, description: e.target.value})}
                rows="3"
                required
              />
              <div className="emergency-actions">
                <button type="submit" className="confirm-emergency">
                  Broadcast Emergency
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowEmergencyForm(false)}
                  className="cancel-emergency"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="emergency-alerts">
        {alerts.map(alert => (
          <div key={alert.id} className="emergency-alert">
            <div className="emergency-header">
              <span className="emergency-icon">🚨</span>
              <strong>EMERGENCY - {alert.title}</strong>
            </div>
            <p>{alert.description}</p>
            <div className="emergency-footer">
              <span>From: {alert.sender} ({alert.senderDepartment})</span>
              <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmergencyAlert