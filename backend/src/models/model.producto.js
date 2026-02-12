import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/service.connection.js';

class Producto extends Model {
    
    static async agregarStock(id, cantidad) {
        const product = await this.findByPk(id); // Ojo: es findByPk (k minúscula)
        if (!product) throw new Error('Producto no encontrado');
        return await product.update({
            stock_actual: product.stock_actual + cantidad
        });
    }

    validarDisponibilidad(cantidadPedida) {
        return this.stock_actual >= cantidadPedida;
    }

    static async agregarProducto(datos) {
        return await this.create(datos);
    }

    static async eliminarProducto(id) {
        return await this.update({ activo: false }, {
            where: { id }
        });
    }

    static async actualizarProducto(id, datos) {
        return await this.update(datos, {
            where: { id }
        });
    }
}

Producto.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock_actual: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    imagen_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Producto',
    tableName: 'inventario',
    timestamps: false
});

export default Producto;