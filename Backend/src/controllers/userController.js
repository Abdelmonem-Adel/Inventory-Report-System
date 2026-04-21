import bcrypt from 'bcrypt';
import User from '../DB/models/user.model.js';

const userController = {
  // List all users (protected)
  // Returns all users except passwords
  getUsers: async (req, res) => {
    try {
      const users = await User.find({}, '-password');
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // Create user (Admin & Top Admin)
  // Validates input, checks for duplicate, hashes password
  createUser: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
      }
      if (!['top_admin', 'admin', 'keeper', 'shiftLeader', 'manager', 'planner'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role.' });
      }
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({ message: 'Email already exists.' });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashed, role });
      await user.save();
      res.status(201).json({ message: 'User created.' });
    } catch (err) {
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // Edit user (Top Admin only)
  // Validates input, updates user fields
  editUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
      }
      if (role && !['top_admin', 'admin', 'keeper', 'shiftLeader', 'manager', 'planner'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role.' });
      }
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      await user.save();
      res.json({ message: 'User updated.' });
    } catch (err) {
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // Delete user (Top Admin only)
  // Deletes user by ID
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      res.json({ message: 'User deleted.' });
    } catch (err) {
      res.status(500).json({ message: 'Server error.' });
    }
  }
};

export default userController;
