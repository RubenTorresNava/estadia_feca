import ResumenVenta from "../models/views/vew.resumenventa.js";
import StockCritico from "../models/views/view.stockcritico.js";
import OrdenesPendientes from "../models/views/view.ordenespendientes.js";
import ResumenContable from "../models/views/view.resumencontable.js";


export const obtenerResumenVenta = async (req, res) => {
    try{
        const [caja, alertas, pendientes, resumen_contable] = await Promise.all([
            ResumenVenta.findAll(),
            StockCritico.findAll(),
            OrdenesPendientes.findAll(),
            ResumenContable.findAll()
        ]);

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