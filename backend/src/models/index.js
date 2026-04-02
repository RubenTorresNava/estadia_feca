import Usuario from './model.usuario.js';
import OrdenVenta from './model.ordenventa.js';
import DetalleOrden from './model.detalleorden.js';
import Producto from './model.producto.js';

export const configurarRelaciones = () => {
    // Relación Usuario <-> OrdenVenta
    Usuario.hasMany(OrdenVenta, { foreignKey: 'usuario_id', as: 'pedidos' });
    OrdenVenta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

    // Relación OrdenVenta <-> Detalle
    OrdenVenta.hasMany(DetalleOrden, { foreignKey: 'orden_id', as: 'detalles' });
    DetalleOrden.belongsTo(OrdenVenta, { foreignKey: 'orden_id' });

    // Relación Detalle <-> Producto
    DetalleOrden.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

    console.log("✅ Relaciones de Sequelize vinculadas correctamente.");
};