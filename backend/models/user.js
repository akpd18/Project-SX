const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },

  dob: { type: String },
  nationalId: { type: String },
  country: { type: String },
  address: { type: String },
  
  role: { 
    type: String, 
    enum: ['Standard', 'VIP', 'S-VIP', 'Potential'], 
    default: 'Standard' 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Locked'], 
    default: 'Active' 
  }
}, { 
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);