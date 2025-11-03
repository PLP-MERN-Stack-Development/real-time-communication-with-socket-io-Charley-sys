const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

// Hospital constants
const HOSPITAL_DEPARTMENTS = {
  EMERGENCY: 'emergency',
  CARDIOLOGY: 'cardiology', 
  NEUROLOGY: 'neurology',
  PEDIATRICS: 'pediatrics',
  SURGERY: 'surgery',
  RADIOLOGY: 'radiology',
  LAB: 'lab',
  PHARMACY: 'pharmacy',
  ADMINISTRATION: 'administration'
};

const USER_ROLES = {
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  TECHNICIAN: 'technician',
  ADMIN: 'admin'
};

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Enhanced CORS for production
const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'https://your-netlify-app.netlify.app' // Replace with your actual Netlify URL
  ].filter(Boolean),
  methods: ['GET', 'POST'],
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Health check endpoint (important for Render)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Hospital Communication Backend'
  });
});

// Hospital data stores
const hospitalUsers = new Map();
const departmentRooms = new Map();

// Initialize department rooms
Object.values(HOSPITAL_DEPARTMENTS).forEach(dept => {
  departmentRooms.set(dept, {
    id: dept,
    name: `${dept.charAt(0).toUpperCase() + dept.slice(1)} Department`,
    messages: [],
    onlineUsers: new Set()
  });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`🏥 User connected: ${socket.id}`);

  socket.on('healthcare_join', (userData) => {
    const user = {
      id: socket.id,
      username: userData.username,
      displayName: userData.displayName,
      role: userData.role,
      department: userData.department,
      isOnline: true,
      status: 'available'
    };

    hospitalUsers.set(socket.id, user);
    socket.join(user.department);
    
    const department = departmentRooms.get(user.department);
    if (department) {
      department.onlineUsers.add(socket.id);
    }

    socket.to(user.department).emit('department_user_joined', {
      user: user.displayName,
      role: user.role
    });

    io.to(user.department).emit('department_users_update', 
      Array.from(hospitalUsers.values()).filter(u => 
        u.department === user.department && u.isOnline
      )
    );

    console.log(`👨‍⚕️ ${user.displayName} joined ${user.department}`);
  });

  // ... (rest of your socket event handlers remain the same)
  socket.on('send_department_message', (messageData) => {
    const user = hospitalUsers.get(socket.id);
    if (!user) return;

    const message = {
      id: Date.now(),
      sender: user.displayName,
      senderId: socket.id,
      senderRole: user.role,
      department: user.department,
      content: messageData.content,
      timestamp: new Date().toISOString()
    };

    const department = departmentRooms.get(user.department);
    if (department) {
      department.messages.push(message);
      if (department.messages.length > 200) {
        department.messages.shift();
      }
    }

    io.to(user.department).emit('receive_department_message', message);
  });

  socket.on('send_private_message', ({ toUserId, content }) => {
    const fromUser = hospitalUsers.get(socket.id);
    const toUser = hospitalUsers.get(toUserId);
    
    if (!fromUser || !toUser) return;

    const message = {
      id: Date.now(),
      from: fromUser.displayName,
      fromId: socket.id,
      to: toUser.displayName,
      toId: toUserId,
      content: content,
      timestamp: new Date().toISOString()
    };

    io.to(socket.id).emit('receive_private_message', message);
    io.to(toUserId).emit('receive_private_message', message);
  });

  socket.on('send_emergency_alert', (alertData) => {
    const user = hospitalUsers.get(socket.id);
    if (!user) return;

    const alert = {
      id: Date.now(),
      sender: user.displayName,
      senderDepartment: user.department,
      title: alertData.title,
      description: alertData.description,
      priority: 'critical',
      timestamp: new Date().toISOString()
    };

    io.emit('emergency_alert', alert);
    console.log(`🚨 EMERGENCY: ${user.displayName} - ${alert.title}`);
  });

  socket.on('disconnect', () => {
    const user = hospitalUsers.get(socket.id);
    if (user) {
      const department = departmentRooms.get(user.department);
      if (department) {
        department.onlineUsers.delete(socket.id);
      }

      socket.to(user.department).emit('department_user_left', {
        user: user.displayName
      });

      io.to(user.department).emit('department_users_update', 
        Array.from(hospitalUsers.values()).filter(u => 
          u.department === user.department && u.isOnline
        )
      );

      console.log(`👋 ${user.displayName} disconnected`);
    }
    hospitalUsers.delete(socket.id);
  });
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'Hospital Communication System',
    onlineUsers: hospitalUsers.size,
    departments: departmentRooms.size,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/departments', (req, res) => {
  const departments = Array.from(departmentRooms.values()).map(dept => ({
    id: dept.id,
    name: dept.name,
    onlineCount: dept.onlineUsers.size
  }));
  res.json(departments);
});

app.get('/api/users', (req, res) => {
  res.json(Array.from(hospitalUsers.values()));
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🏥 Hospital Communication System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      departments: '/api/departments',
      users: '/api/users'
    },
    documentation: 'WebSocket connections available for real-time communication'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 Hospital Communication System running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;