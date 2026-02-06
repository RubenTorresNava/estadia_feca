import { DataTypes } from 'sequelize';
import sequelize from '../services/service.connection.js';

const Administrador = sequelize.define('Administrador', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
},
{
    tableName: 'administrador',
    timestamps: false
});


export default Administrador;