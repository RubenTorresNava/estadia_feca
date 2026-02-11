import sequelize from "../../services/service.connection.js";
import { DataTypes } from "sequelize";

const ResumenContable = sequelize.define('resumen_contable', {
    total_ordenes_pagadas: { 
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    ingresos_totales: DataTypes.DECIMAL(10, 2),
}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'vista_resumen_contable'
});

export default ResumenContable;