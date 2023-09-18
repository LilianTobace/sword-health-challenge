const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }
  }
  Task.init({
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
      foreignKey: true,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
  }, {
    sequelize,
    modelName: 'Tasks',
  });
  return Task;
};
