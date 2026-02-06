import { DataTypes, Model } from 'sequelize';
import sequelize from '../service/connection.js';

const Venta = sequelize.define('Venta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    odrden_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            Model: 'ordenventa',
            key: 'id'
        }
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            Model: 'producto',
            key: 'id'
        }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    precio_unitario: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
},
{
    tableName: 'venta',
    timestamps: false
});

export default Venta;