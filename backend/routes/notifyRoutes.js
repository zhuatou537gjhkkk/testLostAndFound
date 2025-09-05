const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');

/**
 * @swagger
 * tags:
 *   name: 邮件通知
 *   description: 系统或管理员发送邮件通知
 */

/**
 * @swagger
 * /api/notify/test-email:
 *   post:
 *     tags: [邮件通知]
 *     summary: 发送测试邮件通知
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               subject:
 *                 type: string
 *                 example: 测试邮件
 *               message:
 *                 type: string
 *                 example: 这是一封测试邮件内容
 *     responses:
 *       200:
 *         description: 邮件发送成功
 *       500:
 *         description: 邮件发送失败
 */
router.post('/test-email', async (req, res) => {
  const { email, subject, message } = req.body;
  try {
    await sendEmail(email, subject, `<p>${message}</p>`);
    res.json({ message: '📬 邮件已成功发送' });
  } catch (err) {
    res.status(500).json({ error: '❌ 邮件发送失败', detail: err.message });
  }
});

module.exports = router;
