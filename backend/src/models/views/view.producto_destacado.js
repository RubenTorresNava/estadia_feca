import { DataTypes } from "sequelize";
import sequelize from "../../services/service.connection.js";

export const ProductosDestacados = sequelize.define('productos_destacados', {
    id: { type: DataTypes.INTEGER, primary_key: true },
    nombre: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    precio: DataTypes.DECIMAL(10, 2),
    imagen_url: DataTypes.STRING
}, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'vista_productos_destacados'
});