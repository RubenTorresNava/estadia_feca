import { DataTypes } from "sequelize";
import sequelize from "../../services/service.connection.js";

export const ProductosTienda = sequelize.define('productos_tienda', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    precio: DataTypes.DECIMAL(10, 2),
    imagen_url: DataTypes.STRING,
    disponibilidad: DataTypes.STRING,
    categoria: DataTypes.STRING
}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'vista_tienda_publica'
});