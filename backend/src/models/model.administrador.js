import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/service.connection.js';
import Producto from './model.producto.js';
import OrdenVenta from './model.ordenventa.js';


class Administrador extends Model{
    static iniciarSesion(usuario, password){
        if(!usuario || !password)
             throw new Error('Usuario y contraseña son requeridos' );
        return this.findOne({
            where: {
                usuario,
                password
            }
        });
    }
    agregarProducto(datos){
        return Producto.agregarProducto(datos);
    }
    eliminarProducto(id){
        return Producto.eliminarProducto(id);
    }
    modificarProducto(id, datos){
        return Producto.actualizarProducto(id, datos);
    }
    validarOrdden(){
        return OrdenVenta.validarOrden();
    }
}

Administrador.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false

    }
}, {
    sequelize,
    modelName: 'Administrador',
    tableName: 'administrador',
    timestamps: false
});

export default Administrador;