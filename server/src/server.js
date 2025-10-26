const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

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
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Hospital data stores
const hospitalUsers = {};
const departmentRooms = {};

// Initialize department rooms
Object.values(HOSPITAL_DEPARTMENTS).forEach(dept => {
  departmentRooms[dept] = {
    id: dept,
    name: `${dept.charAt(0).toUpperCase() + dept.slice(1)} Department`,
    messages: [],
    onlineUsers: new Set()
  };
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`🏥 Healthcare professional connected: ${socket.id}`);

  // Handle healthcare professional joining
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

    hospitalUsers[socket.id] = user;

    // Join department room
    socket.join(user.department);
    departmentRooms[user.department].onlineUsers.add(socket.id);

    // Notify department
    socket.to(user.department).emit('department_user_joined', {
      user: user.displayName,
      role: user.role
    });

    // Send updated user list
    io.to(user.department).emit('department_users_update', 
      getDepartmentUsers(user.department)
    );

    console.log(`👨‍⚕️ ${user.displayName} (${user.role}) joined ${user.department}`);
  });

  // Handle department messages
  socket.on('send_department_message', (messageData) => {
    const user = hospitalUsers[socket.id];
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

    // Store message
    departmentRooms[user.department].messages.push(message);
    
    // Limit stored messages
    if (departmentRooms[user.department].messages.length > 200) {
      departmentRooms[user.department].messages.shift();
    }

    // Broadcast to department
    io.to(user.department).emit('receive_department_message', message);
  });

  // Handle private messages
  socket.on('send_private_message', ({ toUserId, content }) => {
    const fromUser = hospitalUsers[socket.id];
    const toUser = hospitalUsers[toUserId];
    
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

    // Send to both users
    io.to(socket.id).emit('receive_private_message', message);
    io.to(toUserId).emit('receive_private_message', message);
  });

  // Handle emergency alerts
  socket.on('send_emergency_alert', (alertData) => {
    const user = hospitalUsers[socket.id];
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

    // Broadcast to all users
    io.emit('emergency_alert', alert);
    console.log(`🚨 EMERGENCY: ${user.displayName} - ${alert.title}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = hospitalUsers[socket.id];
    if (user) {
      // Remove from department
      if (departmentRooms[user.department]) {
        departmentRooms[user.department].onlineUsers.delete(socket.id);
      }

      // Notify department
      socket.to(user.department).emit('department_user_left', {
        user: user.displayName
      });

      // Update user lists
      io.to(user.department).emit('department_users_update', 
        getDepartmentUsers(user.department)
      );

      console.log(`👋 ${user.displayName} disconnected`);
    }

    delete hospitalUsers[socket.id];
  });

  // Helper function
  function getDepartmentUsers(department) {
    return Object.values(hospitalUsers).filter(user => 
      user.department === department && user.isOnline
    );
  }
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'Hospital Communication System',
    onlineUsers: Object.keys(hospitalUsers).length,
    departments: Object.keys(departmentRooms).length
  });
});

app.get('/api/departments', (req, res) => {
  const departments = Object.values(departmentRooms).map(dept => ({
    id: dept.id,
    name: dept.name,
    onlineCount: dept.onlineUsers.size
  }));
  res.json(departments);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(hospitalUsers));
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🏥 Hospital Communication System Server',
    endpoints: {
      health: '/api/health',
      departments: '/api/departments',
      users: '/api/users'
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🏥 Hospital Communication System running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Departments: http://localhost:${PORT}/api/departments`);
});

module.exports = { app, server, io };