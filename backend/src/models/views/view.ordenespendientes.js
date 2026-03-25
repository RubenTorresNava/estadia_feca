import sequelize from "../../services/service.connection.js";
import { DataTypes } from "sequelize";

const OrdenesRevision = sequelize.define('ordenes_revision', {
    orden_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    folio_referencia: DataTypes.STRING, 
    nombre_alumno: DataTypes.STRING,
    matricula: DataTypes.STRING,
    correo: DataTypes.STRING,
    total_pago: DataTypes.DECIMAL(10, 2),
    estado: DataTypes.ENUM('pendiente', 'en_revision', 'rechazado'),
    comprobante_url: DataTypes.STRING,
    fecha_creacion: DataTypes.DATE,
}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'vista_revision_pagos'
});

export default OrdenesRevision;