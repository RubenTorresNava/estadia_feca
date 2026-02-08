import OrdenVenta from '../models/model.ordenventa.js';
import HistorialContable from '../models/model.historialcontable.js';
import sequelize from '../services/service.connection.js';

export const obtenerOrdenes = async (req, res) => {
    try {
        const ordenes = await OrdenVenta.findAll({
            order: [['fecha_creacion', 'DESC']]
        });
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las órdenes" });
    }
};

// 2. Confirmar el Pago (La acción clave)
export const confirmarPago = async (req, res) => {
    const { id } = req.params;
    const { administrador_id } = req.body;

    // Ahora sequelize ya estará definido gracias al import
    const t = await sequelize.transaction();

    try {
        // Establecemos el ID del admin para que el Trigger lo use
        await sequelize.query(`SET LOCAL app.current_admin_id = '${administrador_id}'`, { transaction: t });

        // Actualizamos a 'pagada' (en minúsculas por el ENUM que recreamos)
        await OrdenVenta.update(
            { estado: 'pagada' }, 
            { where: { id }, transaction: t }
        );

        await t.commit();
        res.json({ msg: "Pago confirmado y registrado con éxito" });

    } catch (error) {
        if (t) await t.rollback();
        console.error("Error en confirmarPago:", error);
        res.status(500).json({ error: error.message });
    }
};