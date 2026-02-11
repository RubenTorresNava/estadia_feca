import cron from 'node-cron';
import { Op } from 'sequelize';
import OrdenVenta from '../models/model.ordenventa.js';

const tarea = async () => {
    
    const fechaLimite = new Date();
    fechaLimite.setHours(fechaLimite.getHours() - 24);

    try {
        const [actualizados] = await OrdenVenta.update(
            { estado: 'cancelada' },
            {
                where: {
                    estado: 'pendiente',
                    fecha_creacion: { [Op.lt]: fechaLimite }
                }
            }
        );
        console.log(`[CRON] Resultado: ${actualizados} órdenes canceladas.`);
    } catch (error) {
        console.error('[CRON] Error:', error);
    }
};

cron.schedule('0 * * * *', tarea);

tarea(); 

export default tarea;