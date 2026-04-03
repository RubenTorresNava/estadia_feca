import { DataTypes } from "sequelize";
import sequelize from "../../services/service.connection.js";

const MisPedidos = sequelize.define('mis_pedidos', {
    orden_id: { type: DataTypes.INTEGER, primaryKey: true },
    usuario_id: DataTypes.INTEGER,
    folio_referencia: DataTypes.STRING,
    total_pago: DataTypes.DECIMAL(10, 2),
    estado: DataTypes.ENUM('pendiente', 'en_revision', 'pagada', 'rechazado', 'cancelado', 'listo'),
    comprobante_url: DataTypes.STRING,
    nota_admin: DataTypes.TEXT,
    resumen_productos: DataTypes.STRING,
    fecha_creacion: DataTypes.DATE
}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'vista_mis_pedidos'
});

export default MisPedidos;