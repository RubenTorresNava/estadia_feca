import sequelize from "../../services/service.connection.js";
import { DataTypes } from "sequelize";

const OrdenesPendientes = sequelize.define('ordenes_pendientes', {
    orden_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    folio_referencia: DataTypes.STRING, 
    nombre_alumno: DataTypes.STRING,
    matricula: DataTypes.STRING,
    total_pago: DataTypes.DECIMAL(10, 2),
    fecha_creacion: DataTypes.DATE,
    resumen_productos: DataTypes.STRING,
}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'vista_ordenes_pendientes'
});

export default OrdenesPendientes;