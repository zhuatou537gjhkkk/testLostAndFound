const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // SQLite 数据文件路径
  logging: false
});

module.exports = sequelize;
