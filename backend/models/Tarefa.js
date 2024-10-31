const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Tarefa = sequelize.define('Tarefa', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true, 
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  cost: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, 
  },
});


Tarefa.sync({ alter: true });

module.exports = Tarefa;
