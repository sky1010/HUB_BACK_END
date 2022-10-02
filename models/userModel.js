const { Sequelize } = require("sequelize");
const mySQL = require("../config/database");
const bcrypt = require("bcryptjs");
const ClientModal = require("./clientModel");
const { DataTypes } = Sequelize;

const User = mySQL.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    userName: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: false,
    },
    password: {
      type: DataTypes.STRING,
    },
    client: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);
(async () => {
  await User.sync({ alter: true });
})();

module.exports = User;
