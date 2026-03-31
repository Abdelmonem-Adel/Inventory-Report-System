import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../DB/models/user.model.js';


// Login Controller
// Validates input, checks user, compares password, returns JWT
const authController = {
  login: async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);

    const user = await User.findOne({ email });
    console.log("USER:", user);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.password) {
      console.log("❌ USER HAS NO PASSWORD");
      return res.status(500).json({ message: 'User password missing.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err); // 👈 أهم سطر
    res.status(500).json({ message: 'Server error.' });
  }
}
};

export default authController;
