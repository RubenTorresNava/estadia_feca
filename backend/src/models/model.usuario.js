// model.usuario.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/service.connection.js';
import OrdenVenta from './model.ordenventa.js';
import bcrypt from 'bcryptjs';

class Usuario extends Model {
    validarPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

Usuario.init({
    id: { 
        type: DataTypes.INTEGER,
         primaryKey: true, 
         autoIncrement: true 
    },
    matricula: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: true 
    },
    nombre: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    correo: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false, 
        validate: { isEmail: true } 
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    rol: { 
        type: DataTypes.ENUM('alumno', 'admin', 'staff'), 
        defaultValue: 'alumno' 
    },
    activo: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
}, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: false,
    hooks: {
        beforeCreate: async (user) => {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
    }
});

Usuario.hasMany(OrdenVenta, { foreignKey: 'usuario_id' });
OrdenVenta.belongsTo(Usuario, { foreignKey: 'usuario_id' });

export default Usuario;