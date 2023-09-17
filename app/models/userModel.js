/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../utils/database');

const roles = {
  Manager: 'manager',
  Technician: 'technician',
};

const hashPassword = (value) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = (bcrypt.hashSync(value, salt)).toString();
    console.log({ hash });
    return hash;
  } catch (err) {
    throw new Error(err);
  }
};

const userModel = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [[roles.Manager, roles.Technician]],
      notEmpty: true,
      notNull: true,
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 50],
      notEmpty: true,
      notNull: true,
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [7, 15],
      notEmpty: true,
      notNull: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      min: 7,
      notEmpty: true,
      notNull: true,
    },
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      const hash = hashPassword(user.password);
      user.password = hash;
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const hash = hashPassword(user.password);
        user.password = hash;
      }
    },
  },
  instanceMethods: {
    validPassword: (password) => bcrypt.compareSync(password, this.password),
  },
  tableName: 'users',
  timestamps: true,
});

userModel.verifyUsername = async (username) => userModel.findOne({ where: { username } });

userModel.verifyPassword = async (user, password) => {
  const verifyPassword = bcrypt.compareSync(password, user.password);
  if (verifyPassword) return password;
  return null;
};

userModel.validCredentials = async (username, password) => {
  const user = await userModel.verifyUsername(username);
  if (user) {
    const passwordValidated = await userModel.verifyPassword(user, password);
    if (passwordValidated) return user;
  }
  return null;
};

userModel.generateToken = (user) => jwt.sign({
  id: user.id, role: user.role,
}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_SECRET_EXPIRES_IN });

module.exports = { roles, userModel };
