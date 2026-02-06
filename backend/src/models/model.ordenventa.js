import { DataTypes } from 'sequelize';
import sequelize from '../services/service.connection.js';

const OrdenVenta = sequelize.define('OrdenVenta', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    folio_referencia:{
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha_creacion:{
        type: DataTypes.DATE,
        allowNull: false
    },
    nombre_alumno:{
        type: DataTypes.STRING,
        allowNull: false
    },
    matricula:{
        type: DataTypes.STRING,
        allowNull: false
    },
    estado:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDIENTE'
    }
},
{
    tableName: 'ordenventa',
    timestamps: false
});

Administrador.hasMany(OrdenVenta, { foreignKey: 'administrador_id' });
OrdenVenta.belongsTo(Administrador, { foreignKey: 'administrador_id' });

export default OrdenVenta;