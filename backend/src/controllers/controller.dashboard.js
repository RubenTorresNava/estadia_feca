import ResumenVenta from "../models/views/vew.resumenventa.js";
import StockCritico from "../models/views/view.stockcritico.js";
import OrdenesPendientes from "../models/views/view.ordenespendientes.js";
import OrdenVenta from "../models/model.ordenventa.js";
import { Op, fn, col } from "sequelize";


export const obtenerResumenVenta = async (req, res) => {
    try{
        const [caja, alertas, pendientes, resumenPagadas, pagosPendientesRevisar] = await Promise.all([
            ResumenVenta.findAll(),
            StockCritico.findAll(),
            OrdenesPendientes.findAll(),
            OrdenVenta.findOne({
                attributes: [
                    [fn('COUNT', col('id')), 'total_ordenes_pagadas'],
                    [fn('COALESCE', fn('SUM', col('total_pago')), 0), 'ingresos_totales']
                ],
                where: {
                    estado: {
                        [Op.in]: ['pagada', 'listo']
                    }
                },
                raw: true
            }),
            OrdenVenta.count({
                where: {
                    estado: 'en_revision'
                }
            })
        ]);

        const resumen_contable = [{
            total_ordenes_pagadas: Number(resumenPagadas?.total_ordenes_pagadas || 0),
            ingresos_totales: Number(resumenPagadas?.ingresos_totales || 0),
            pagos_pendientes_revisar: Number(pagosPendientesRevisar || 0)
        }];

        res.json({
            resumen_caja: caja,
            alertas_stock: alertas,
            ordenes_pendientes: pendientes,
            resumen_contable: resumen_contable
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};