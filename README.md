🏥 Hospital Communication System
A real-time communication platform built for healthcare professionals using the MERN stack and Socket.io. This system enables seamless communication between doctors, nurses, and hospital staff across different departments with instant messaging and emergency alert capabilities.

https://img.shields.io/badge/Status-Deployed-success https://img.shields.io/badge/Stack-MERN-blue https://img.shields.io/badge/Real--Time-Socket.io-green

🌟 Live Demo
Frontend:https://6908e81b93fa1fc7c5e6b163--elegant-tanuki-d0cbe3.netlify.app/login

Backend API: https://hospital-communication-system-server.onrender.com/

API Health Check: https://hospital-communication-system-server.onrender.com/api/health

📋 Table of Contents
Features

Technology Stack

System Architecture

Installation

API Documentation

Socket Events

Deployment

Project Structure

Contributing

License

🚀 Features
Real-time Communication
Department-based Chat Rooms: Secure communication within hospital departments

Private Messaging: One-on-one conversations between staff members

Emergency Alert System: Broadcast critical alerts to all connected users

User Presence: Real-time online/offline status indicators

User Management
Role-based Access: Different permissions for doctors, nurses, technicians, and admins

Department Assignment: Staff organized by medical departments

User Authentication: Secure login and session management

Hospital Departments Supported
🚑 Emergency

❤️ Cardiology

🧠 Neurology

👶 Pediatrics

🔪 Surgery

📷 Radiology

🧪 Laboratory

💊 Pharmacy

🏢 Administration

Security Features
CORS Protection: Configured for production and development environments

Rate Limiting: Prevents API abuse

Helmet.js: Security headers protection

Input Validation: Server-side validation for all inputs

🛠 Technology Stack
Frontend
React 18 - Modern UI library

Vite - Fast build tool and dev server

Socket.io Client - Real-time communication

React Router DOM - Client-side routing

CSS3 - Custom styling and responsive design

Backend
Node.js - Runtime environment

Express.js - Web framework

Socket.io - Real-time bidirectional communication

CORS - Cross-origin resource sharing

Helmet - Security middleware

Express Rate Limit - Rate limiting middleware

Deployment
Netlify - Frontend hosting

Render - Backend hosting

Environment Variables - Secure configuration management

🏗 System Architecture
text
Client (Vercel) ← WebSocket → Server (Render) ←→ In-Memory Storage
     ↑                              ↑
     |                              |
 React App                    Express.js + Socket.io
     |                              |
     |                        Department Rooms
     |                        User Sessions
     |                        Message Broadcasting
     |
 Real-time UI Updates
📥 Installation
Prerequisites
Node.js 18+

npm or yarn

Git

Local Development Setup
Clone the repository

bash
git clone https://github.com/yourusername/hospital-communication-system.git
cd hospital-communication-system
Backend Setup

bash
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
Frontend Setup

bash
cd frontend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
Access the application

Frontend: http://localhost:5173

Backend API: http://localhost:5000

Environment Variables
Backend (.env)

env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
Frontend (.env)

env
VITE_API_URL=http://localhost:5000
📚 API Documentation
Base URL
text
https://hospital-communication-system-server.onrender.com/api/health
Health Check
http
GET /api/health
Response:

json
{
  "status": "OK",
  "server": "Hospital Communication System",
  "onlineUsers": 5,
  "departments": 9
}
Get Departments
http
GET /api/departments
Response:

json
[
  {
    "id": "emergency",
    "name": "Emergency Department",
    "onlineCount": 3
  }
]
Get Users
http
GET /api/users
Response:

json
[
  {
    "id": "socket_id",
    "username": "dr_smith",
    "displayName": "Dr. Smith",
    "role": "doctor",
    "department": "emergency",
    "isOnline": true
  }
]
🔌 Socket Events
Client to Server Events
Event	Data	Description
healthcare_join	{username, displayName, role, department}	Join hospital network
send_department_message	{content}	Send message to department
send_private_message	{toUserId, content}	Send private message
send_emergency_alert	{title, description}	Broadcast emergency alert
Server to Client Events
Event	Data	Description
department_user_joined	{user, role}	User joined department
department_user_left	{user}	User left department
receive_department_message	Message object	New department message
receive_private_message	Message object	New private message
emergency_alert	Alert object	Emergency alert received
department_users_update	User[]	Updated user list
🚀 Deployment
Backend Deployment on Render
Push code to GitHub

Connect repository to Render

Configure Web Service:

Build Command: npm install

Start Command: npm start

Set environment variables in Render dashboard

Frontend Deployment on Vercel
Push frontend code to GitHub

Import project in Vercel

Configure build settings:

Framework: Vite

Build Command: npm run build

Output Directory: dist

Set environment variables in Vercel dashboard

📁 Project Structure
text
hospital-communication-system/
├── 📁 server/                 # Backend application
│   ├── 📄 server.js          # Main server file
│   ├── 📄 package.json       # Dependencies and scripts
│   ├── 📁 src/               # Source code
│   │   ├── 📁 models/        # Data models
│   │   ├── 📁 routes/        # API routes
│   │   ├── 📁 middleware/    # Custom middleware
│   │   └── 📁 config/        # Configuration files
│   └── 📄 .env              # Environment variables
│
├── 📁 frontend/              # Frontend application
│   ├── 📄 package.json       # Dependencies and scripts
│   ├── 📄 vite.config.js     # Vite configuration
│   ├── 📄 index.html         # HTML template
│   └── 📁 src/               # Source code
│       ├── 📄 main.jsx       # React entry point
│       ├── 📄 App.jsx        # Main App component
│       ├── 📁 components/    # React components
│       ├── 📁 hooks/         # Custom React hooks
│       ├── 📁 utils/         # Utility functions
│       └── 📁 assets/        # Static assets
│
└── 📄 README.md              # Project documentation
👥 Contributing
We welcome contributions to improve the Hospital Communication System!

Development Workflow
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

Code Standards
Use meaningful commit messages

Follow existing code style

Add comments for complex logic

Test all features before submitting

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🆘 Support
If you encounter any issues or have questions:

Check the API Documentation

Review the Socket Events reference

Create an issue on GitHub

Contact the development team

🙏 Acknowledgments
Socket.io team for excellent real-time communication library

Netlify and Render for generous free hosting tiers

React community for comprehensive documentation

Healthcare professionals who provided valuable feedback

Built with ❤️ for better healthcare communication

This project was developed as part of a MERN stack assignment focusing on real-time communication with Socket.io.