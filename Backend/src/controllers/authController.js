import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../DB/models/user.model.js';


// Login Controller
const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }
      // Basic email format validation
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'supersecret',
        { expiresIn: '30d' }
      );
      res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: 'Server error.' });
    }
  }
};

export default authController;
