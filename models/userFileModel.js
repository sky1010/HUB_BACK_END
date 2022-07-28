const { Sequelize } = require("sequelize");
const mySQL = require("../config/database");

const { DataTypes } = Sequelize;

const UserFiles = mySQL.define(
  "User_files",
  {
    file_name: {
      type: DataTypes.STRING,
    },
    file_location: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
    },
    client: {
      type: DataTypes.INTEGER,
    },
    user: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);
(async () => {
  await UserFiles.sync({ alter: true });
})();
module.exports = UserFiles;
