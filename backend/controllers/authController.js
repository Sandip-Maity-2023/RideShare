const User = require('../models/User'); // Adjust path if needed
const bcrypt = require('bcryptjs');     // <--- CHANGED THIS FROM 'bcrypt' TO 'bcryptjs'
const jwt = require('jsonwebtoken');

// Driver Login Function
exports.driverLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Compare the entered password with the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'super_secret_key', 
      { expiresIn: '1d' }
    );

    // 4. Send response
    res.json({
      message: 'Driver login successful',
      token,
      driver: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error during driver login' });
  }
};