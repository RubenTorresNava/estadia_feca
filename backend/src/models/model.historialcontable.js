import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/service.connection.js';

class HistorialContable extends Model {
    static async registrarEvento(datos) {
        return this.create(datos);
    }
}

HistorialContable.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orden_id: DataTypes.INTEGER,
    producto_id: DataTypes.INTEGER,
    administrador_id: DataTypes.INTEGER,
    accion:{
        type: DataTypes.STRING,
        allowNull: false
    },
    monto_afectado: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'HistorialContable',
    tableName: 'historial_contable',
    timestamps: false
});

export default HistorialContable;
