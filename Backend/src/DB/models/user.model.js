import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false 
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple users to have null googleId (though email is unique)
  },
  picture: {
    type: String
  },
    role: {
    type: String,
    enum: ['top_admin', 'admin', 'keeper', 'shiftLeader', 'manager', 'planner'],
    default: 'keeper',
    required: true
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
