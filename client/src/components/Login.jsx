import React, { useState } from 'react'

const Login = ({ onLogin, departments }) => {
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    role: 'doctor',
    department: 'emergency'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.username && formData.displayName) {
      onLogin(formData)
    }
  }

  const roles = [
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'technician', label: 'Technician' },
    { value: 'admin', label: 'Administrator' }
  ]

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="hospital-header">
          <h1>🏥 Hospital Communication System</h1>
          <p>Secure real-time communication for healthcare professionals</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Healthcare Professional Login</h2>
          
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label>Display Name:</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              placeholder="Enter your display name"
              required
            />
          </div>

          <div className="form-group">
            <label>Role:</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Department:</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.onlineCount || 0} online)
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="login-btn">
            Join Hospital Network
          </button>
        </form>

        <div className="login-info">
          <h3>System Features:</h3>
          <ul>
            <li>🔒 Secure department-based communication</li>
            <li>🚨 Emergency alert broadcasting</li>
            <li>💬 Private messaging between staff</li>
            <li>📊 Real-time user presence</li>
            <li>🏥 Multi-department support</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Login