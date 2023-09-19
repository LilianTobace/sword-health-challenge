const { Model } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports.roles = {
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

module.exports.User = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      User.hasMany(models.Tasks, {
        foreignKey: 'userId',
        as: 'tasks',
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [[module.exports.roles.Manager, module.exports.roles.Technician]],
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
    sequelize,
    modelName: 'Users',
    timestamps: true,
  });

  User.validCredentials = async (username, password) => {
    const user = await User.findOne({ where: { username } });
    if (user) {
      const passwordValidated = bcrypt.compareSync(password, user.password);
      if (passwordValidated) return user;
    }
    return null;
  };

  User.generateToken = (user) => jwt.sign({
    id: user.id, role: user.role,
  }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_SECRET_EXPIRES_IN });

  return User;
};
