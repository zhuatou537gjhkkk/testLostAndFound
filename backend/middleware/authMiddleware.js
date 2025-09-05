const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '未授权' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: '用户不存在' });

    req.user = { id: decoded.id }; // ✅ 设置整个 user 实体对象
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token 无效' });
  }
};
