import { useState } from 'react';
import { Package, Clock, DollarSign, CheckCircle, UploadCloud } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import api from '../api/api';

export const AdminSummary = () => {
  // 1. Hooks de Contexto (Siempre al inicio)
  const { orders, confirmOrder, fetchOrders } = useCart();
  const { products } = useProducts();

  // 2. Estados Locales (Estaban comentados, por eso el error de "Cannot read properties of null")
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // 3. Lógica de Negocio (Handled Events)
  const toggleOrder = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await confirmOrder(orderId);
    } catch (err) {
      console.error('Error al confirmar la orden:', err);
    }
  };

  const handleAdminUpload = async (orderId: string, file: File) => {
    setUploadingOrderId(orderId);
    setUploadError(null);
    setUploadSuccess(null);
    
    const formData = new FormData();
    formData.append('comprobante', file);
    
    try {
      await api.post(`/alumno/comprobante/${orderId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadSuccess('Comprobante subido con éxito.');
      if (fetchOrders) await fetchOrders(); // Actualizar lista si existe la función
    } catch (err) {
      setUploadError('Error al subir el comprobante.');
      console.error(err);
    } finally {
      setUploadingOrderId(null);
    }
  };

  // 4. Cálculos de Memoria (Derivados del estado/contexto)
  const totalStock = products.reduce((sum, product) => {
    return sum + (Number(product.stock_actual) || 0);
  }, 0);

  const pendingOrders = orders.filter((o) => o.estado === 'pendiente');
  const totalRevenue = orders
    .filter((o) => o.estado === 'pagada')
    .reduce((sum, o) => sum + Number(o.total_pago), 0);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Productos</h3>
          </div>
          <p className="text-3xl font-bold text-dark">{totalStock}</p>
          <p className="text-sm text-gray">Total en catálogo</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Pendientes</h3>
          </div>
          <p className="text-3xl font-bold text-dark">{pendingOrders.length}</p>
          <p className="text-sm text-gray">Órdenes por autorizar</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Ingresos</h3>
          </div>
          <p className="text-3xl font-bold text-dark">${totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray">Total generado</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-dark mb-4">Órdenes Recientes</h2>
        {orders.length === 0 ? (
          <p className="text-gray text-center py-8">No hay órdenes registradas</p>
        ) : (
          <div className="space-y-4">
            {orders.slice().reverse().map((order: any) => (
              <div key={order.id} className="border border-gray/20 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-dark text-lg">Orden #{order.id}</p>
                    <p className="text-sm text-gray font-medium">Ref: {order.folio_referencia}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.nombre_alumno} - {order.correo || 'Sin correo'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.estado === 'pagada' ? 'bg-green-100 text-green-700' : 
                      order.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                    }`}>
                      {order.estado.toUpperCase()}
                    </span>
                    <button 
                      onClick={() => toggleOrder(order.id.toString())}
                      className="text-primary text-xs font-bold hover:underline"
                    >
                      {expandedOrderId === order.id.toString() ? 'Ocultar detalles ▲' : 'Ver productos ▼'}
                    </button>
                    
                    <label className="flex items-center gap-1 cursor-pointer mt-2 text-xs text-blue-700 hover:underline">
                      <UploadCloud className="h-4 w-4" /> Subir/Reemplazar comprobante
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) handleAdminUpload(order.id, e.target.files[0]);
                        }}
                        disabled={uploadingOrderId === order.id}
                      />
                    </label>
                    {uploadingOrderId === order.id && <span className="text-xs text-gray-500">Subiendo...</span>}
                    {uploadSuccess && uploadingOrderId === null && <span className="text-xs text-green-600">{uploadSuccess}</span>}
                  </div>
                </div>

                {expandedOrderId === order.id.toString() && (
                  <div className="mt-3 bg-gray-50 rounded-md p-3 border-l-4 border-primary">
                    <ul className="space-y-2">
                      {order.detalles?.map((detalle: any, idx: number) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span><span className="font-bold text-primary">{detalle.cantidad}x</span> {detalle.producto?.nombre}</span>
                          <span className="text-gray-600">${(Number(detalle.precio_unitario) * detalle.cantidad).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <p className="text-sm font-medium text-gray">Total de la orden:</p>
                  <p className="font-extrabold text-primary text-xl">${Number(order.total_pago).toFixed(2)}</p>
                </div>

                {order.estado === 'pendiente' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleConfirmOrder(order.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                    >
                      <CheckCircle className="h-4 w-4" /> Confirmar Pago
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};