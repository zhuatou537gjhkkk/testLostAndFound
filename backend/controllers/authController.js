// backend/controllers/authController.js

const { User } = require('../models');
const jwt = require('jsonwebtoken');

// ✅ 修改这里：接收整个 user 对象，并把 username 和 email 也放进 token
const createToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = await User.create({ username, password, email });
    const token = createToken(user); // ✅ 传递整个 user 对象
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    const token = createToken(user); // ✅ 传递整个 user 对象
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};