const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { type: String, required: true },
  room: { 
    type: String, 
    enum: ['emergency', 'cardiology', 'pediatrics', 'surgery', 'general'], 
    required: true 
  },
  messageType: { 
    type: String, 
    enum: ['normal', 'emergency', 'alert'], 
    default: 'normal' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);