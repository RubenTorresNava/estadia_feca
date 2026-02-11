import sequelize from "../../services/service.connection.js";
import { DataTypes } from "sequelize";

const StockCritico = sequelize.define('stock_critico', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    nombre: DataTypes.STRING,
    stock_actual: DataTypes.INTEGER,
}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'vista_stock_critico'
});

export default StockCritico;