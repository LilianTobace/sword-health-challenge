const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
// const { encrypt, decrypt } = require('../utils/encrypt');
const { userModel } = require('./userModel');

const taskModel = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true, min: 1, max: 2500,
    },
  },
  datePerformed: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
    },
  },
}, {
  // hooks: {
  //   beforeCreate(task) {
  //     // Encrypt record summary on creation
  //     const { iv, encryptedData } = encrypt(task.summary);
  //     task.iv = iv;
  //     task.summary = encryptedData;
  //   },

  //   beforeUpdate(task) {
  //     // Encrypt record summary whenever it's updated
  //     if (task.changed('summary')) {
  //       const { iv, encryptedData } = encrypt(task.summary);
  //       task.iv = iv;
  //       task.summary = encryptedData;
  //     }
  //   },

  //   afterFind(task) {
  //     if (!task) return;

  //     // If task exists, decrypt summary before returning
  //     if (Array.isArray(task)) {
  //       task.forEach((item) => {
  //         item.summary = decrypt({ iv: item.iv, encryptedData: item.summary });
  //       });
  //     } else {
  //       task.summary = decrypt({ iv: task.iv, encryptedData: task.summary });
  //     }
  //   },
  // },
  tableName: 'tasks',
  timestamps: true,
});

taskModel.belongsTo(userModel, { foreignKey: 'userId' });

module.exports = taskModel;
