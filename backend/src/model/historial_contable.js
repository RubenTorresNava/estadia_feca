import { DataTypes, Model } from 'sequelize';
import Sequelize from 'sequelize';
import OrdenVenta from './ordenventa';

const HistorialContable = Sequelize.define('HistorialContable', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orden_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            Model: 'ordenventa',
            key: 'id'
        }
    },
    administrador_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            Model: 'administrador',
            key: 'id'
        }
    },
    accion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    monto_afectado: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false
    }
},
{
    tableName: 'historial_contable',
    timestamps: false
});

Administrador.hasMany(HistorialContable, { foreignKey: 'administrador_id' });
HistorialContable.belongsTo(Administrador, { foreignKey: 'administrador_id' });

export default HistorialContable;