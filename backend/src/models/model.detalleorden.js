import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/service.connection.js';

class DetalleOrden extends Model {}

DetalleOrden.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orden_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'orden_venta', key: 'id' }
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'inventario', key: 'id' }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'DetalleOrden',
    tableName: 'detalle_orden',
    timestamps: false
});

export default DetalleOrden;