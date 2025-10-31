const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department
    });
    
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role, 
        department: user.department 
      } 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;