const { Sequelize } = require('sequelize');
const mySQL = require('../config/database');

const { DataTypes } = Sequelize;

const Files = mySQL.define('Files', {
    file_name: {
        type: DataTypes.STRING
    },
    file_location: {
        type: DataTypes.STRING
    },
    category: {
        type: DataTypes.STRING
    },
    client: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true
});

module.exports = Files;