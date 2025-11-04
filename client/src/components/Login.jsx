import React, { useState } from 'react'

const Login = ({ onLogin, departments = [] }) => {
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

  // Safe departments list - handle undefined/empty arrays
  const safeDepartments = Array.isArray(departments) && departments.length > 0 
    ? departments 
    : [
        { id: 'emergency', name: 'Emergency Department' },
        { id: 'cardiology', name: 'Cardiology' },
        { id: 'neurology', name: 'Neurology' },
        { id: 'pediatrics', name: 'Pediatrics' },
        { id: 'surgery', name: 'Surgery' }
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
              {safeDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="login-btn">
            Join Hospital Network
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login