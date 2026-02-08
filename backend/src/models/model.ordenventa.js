import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/service.connection.js';

class OrdenVenta extends Model {
    // Método estático para el Cron Job: Cancelar órdenes viejas
    static async cancelarOrdenesVencidas() {
        const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return await this.update({ estado: 'cancelado' }, {
            where: {
                estado: 'pendiente',
                fecha_creacion: { [Sequelize.Op.lt]: hace24Horas }
            }
        });
    }

    // Método para confirmar pago vinculando al admin
    static async confirmarPago(id, administrador_id) {
        return await this.update({ 
            estado: 'pagada', 
            administrador_id 
        }, { where: { id } });
    }
}

OrdenVenta.init({
    folio_referencia: {
        type: DataTypes.STRING,
        unique: true,
        defaultValue: () => `FECA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    },
    nombre_alumno: DataTypes.STRING,
    matricula: DataTypes.STRING,
    total_pago: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'pagada', 'cancelado'),
        defaultValue: 'pendiente'
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, { 
    sequelize, 
    modelName: 'OrdenVenta', 
    tableName: 'orden_venta', 
    timestamps: false 
});

export default OrdenVenta;