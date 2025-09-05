const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'qq', // 可改为 '163', 'gmail' 等
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS // 需要开启 SMTP 授权码
  }
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"失物招领平台" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📬 邮件已发送至', to);
  } catch (err) {
    console.error('❌ 邮件发送失败', err.message);
  }
};

module.exports = sendEmail;
