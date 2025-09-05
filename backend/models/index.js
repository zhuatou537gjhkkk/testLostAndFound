const sequelize = require('../config/db');
const User = require('./user');
const Item = require('./item');
const Message = require('./message');

// 所有模型之间的关联在这里统一声明
User.hasMany(Item, { foreignKey: 'userId' });
Item.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Message, { as: 'SentMessages', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'ReceivedMessages', foreignKey: 'receiverId' });

Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });

module.exports = {
  sequelize,
  User,
  Item,
  Message,
};
