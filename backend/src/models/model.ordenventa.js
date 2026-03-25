// model.ordenventa.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/service.connection.js';
import DetalleOrden from './model.detalleorden.js';

class OrdenVenta extends Model {
    static async cancelarOrdenesVencidas() {
        const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return await this.update({ estado: 'cancelado' }, {
            where: {
                estado: 'pendiente',
                fecha_creacion: { [Op.lt]: hace24Horas }
            }
        });
    }

    static async cambiarEstadoPago(id, estado, nota = "") {
        return await this.update({ 
            estado: estado, 
            nota_admin: nota,
            fecha_pago: estado === 'pagada' ? new Date() : null
        }, { where: { id } });
    }
}

OrdenVenta.init({
    folio_referencia: {
        type: DataTypes.STRING,
        unique: true,
        defaultValue: () => `FECA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    },
    usuario_id: { 
        type: DataTypes.INTEGER, 
        references: { model: 'usuarios', key: 'id' } 
    },
    total_pago: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    estado: {
        type: DataTypes.ENUM('pendiente', 'en_revision', 'pagada', 'rechazado', 'cancelado'),
        defaultValue: 'pendiente'
    },
    comprobante_url: { type: DataTypes.STRING, allowNull: true },
    nota_admin: { type: DataTypes.TEXT, allowNull: true },
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { 
    sequelize, 
    modelName: 'OrdenVenta', 
    tableName: 'orden_venta', 
    timestamps: false 
});

OrdenVenta.hasMany(DetalleOrden, { foreignKey: 'orden_id', as: 'detalles' });
DetalleOrden.belongsTo(OrdenVenta, { foreignKey: 'orden_id' });

export default OrdenVenta;