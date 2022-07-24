const { Sequelize } = require('sequelize');
const mySQL = require('../config/database');

const { DataTypes } = Sequelize;

const Translations = mySQL.define('Translations', {
    key: {
        type: DataTypes.STRING
    },
    eng: {
        type: DataTypes.STRING
    },
    fr: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true
});

module.exports = Translations;