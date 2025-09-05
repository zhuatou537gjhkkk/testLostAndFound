const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const Item = sequelize.define('Item', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  image: DataTypes.STRING,//单图
  images: {
    type: DataTypes.JSON,  // 多图字段 
    allowNull: true,
    defaultValue: []
  },
  category: DataTypes.STRING,
  location: DataTypes.STRING,
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,
  type: { type: DataTypes.ENUM('lost', 'found'), allowNull: false },
  date: DataTypes.DATE,
  status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'open',
      validate: {
        isIn: [['open', 'resolved']]
      }
    }
});

User.hasMany(Item, { foreignKey: 'userId' });
Item.belongsTo(User, { foreignKey: 'userId' });

module.exports = Item;
