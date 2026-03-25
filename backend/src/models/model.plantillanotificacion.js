// model.plantilla.js
import { DataTypes } from 'sequelize';
import sequelize from '../services/service.connection.js';

Plantilla.init({
    slug: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false 
    },
    asunto: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    cuerpo: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    }
}, {
    sequelize,
    modelName: 'Plantilla',
    tableName: 'plantillas_notificaciones',
    timestamps: false
});

export default Plantilla;