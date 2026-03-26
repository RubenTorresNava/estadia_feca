import Usuario from './model.usuario.js';
import OrdenVenta from './model.ordenventa.js';
import DetalleOrden from './model.detalleorden.js';
import Producto from './model.producto.js';

// Usuario - OrdenVenta
Usuario.hasMany(OrdenVenta, { foreignKey: 'usuario_id' });
OrdenVenta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// OrdenVenta - DetalleOrden
OrdenVenta.hasMany(DetalleOrden, { foreignKey: 'orden_id', as: 'detalles' });
DetalleOrden.belongsTo(OrdenVenta, { foreignKey: 'orden_id' });

// DetalleOrden - Producto
DetalleOrden.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

export { Usuario, OrdenVenta, DetalleOrden, Producto };