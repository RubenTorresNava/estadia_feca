import { DataTypes } from "sequelize";
import sequelize from "../../services/service.connection.js";


const ResumenVenta = sequelize.define('resumen_venta', {
    folio_referencia: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nombre_alumno: DataTypes.STRING,
    matricula: DataTypes.STRING,
    producto: DataTypes.STRING,
    cantidad: DataTypes.INTEGER,
    precio_unitario: DataTypes.DECIMAL(10, 2),
    subtotal: DataTypes.DECIMAL(10, 2),
    fecha_creacion: DataTypes.DATE,
    estado: DataTypes.ENUM('pendiente', 'pagada', 'cancelada'), 
}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'vista_ventas_completas'
});

export default ResumenVenta;