import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/service.connection.js';

class Venta extends Model {
    static async registrarDetalle(orden_id, productos) {
        const detalles = productos.map(p => ({ ...p, orden_id }));
        return await this.bulkCreate(detalles);
    }
}

Venta.init({
    orden_id: DataTypes.INTEGER,
    producto_id: DataTypes.INTEGER,
    cantidad: DataTypes.INTEGER,
    precio_unitario: DataTypes.DECIMAL(10, 2)
}, { 
    sequelize, 
    modelName: 'Venta', 
    tableName: 'venta', 
    timestamps: false 
});



export default Venta;