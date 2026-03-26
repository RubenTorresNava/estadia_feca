import { useState } from 'react';
import { Package, Clock, DollarSign, CheckCircle, UploadCloud, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import api from '../api/api';

export const AdminSummary = () => {
  // 1. Hooks de Contexto (Siempre al inicio)
  const { orders, fetchOrders } = useCart();
    // Estado para modal/campo de rechazo
    const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState<string>('');
    const [actionLoading, setActionLoading] = useState<string | null>(null); // Para loading de confirm/reject
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


  // Confirmar pago (aprobación)
  const handleConfirmOrder = async (orderId: string) => {
    setActionLoading(orderId + '-confirm');
    try {
      await api.put(`/administrador/revisiones/${orderId}`, {
        decision: 'pagada',
        nota: 'Pago verificado por el administrador.'
      });
      if (fetchOrders) await fetchOrders();
    } catch (err) {
      alert('Error al confirmar la orden.');
      console.error('Error al confirmar la orden:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Rechazar pago (requiere nota)
  const handleRejectOrder = async (orderId: string, nota: string) => {
    setActionLoading(orderId + '-reject');
    try {
      await api.put(`/administrador/revisiones/${orderId}`, {
        decision: 'rechazado',
        nota
      });
      setRejectingOrderId(null);
      setRejectNote('');
      if (fetchOrders) await fetchOrders();
    } catch (err) {
      alert('Error al rechazar la orden.');
      console.error('Error al rechazar la orden:', err);
    } finally {
      setActionLoading(null);
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

  // Órdenes que requieren acción del admin: 'pendiente' o 'en_revision'
  const reviewOrders = orders.filter((o) => o.estado === 'pendiente' || o.estado === 'en_revision');
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
          <p className="text-3xl font-bold text-dark">{reviewOrders.length}</p>
          <p className="text-sm text-gray">Órdenes por revisar</p>
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
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-dark text-lg">Orden #{order.id}</p>
                    <p className="text-sm text-gray font-medium">Ref: {order.folio_referencia}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.nombre_alumno} - {order.correo || 'Sin correo'}</p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold
                        ${order.estado === 'pagada' ? 'bg-green-100 text-green-700'
                        : order.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700'
                        : order.estado === 'en_revision' ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'}
                      `}
                    >
                      {order.estado === 'pagada'
                        ? 'Pagada'
                        : order.estado === 'pendiente'
                        ? 'Pendiente'
                        : order.estado === 'en_revision'
                        ? 'En revisión'
                        : order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                    </span>
                    <button 
                      onClick={() => toggleOrder(order.id.toString())}
                      className="block mt-2 text-primary text-xs font-bold hover:underline"
                    >
                      {expandedOrderId === order.id.toString() ? 'Ocultar detalles ▲' : 'Ver productos ▼'}
                    </button>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-2 md:w-64 w-full">
                    <label className="flex items-center gap-1 cursor-pointer text-xs text-blue-700 hover:underline">
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
                    {order.comprobante_url && (
                      <div className="flex flex-col items-center md:items-end mt-2 w-full">
                        <img
                          src={order.comprobante_url}
                          alt="Comprobante actual"
                          className="w-full max-w-xs md:max-w-xs object-contain rounded border"
                        />
                        <span className="text-xs text-gray-500">Comprobante actual</span>
                      </div>
                    )}
                    {uploadingOrderId === order.id && <span className="text-xs text-gray-500">Subiendo...</span>}
                    {uploadSuccess && uploadingOrderId === null && <span className="text-xs text-green-600">{uploadSuccess}</span>}
                  </div>
                </div>

                {expandedOrderId === order.id.toString() && (
                  <div className="mt-3 bg-gray-50 rounded-md p-3 border-l-4 border-primary">
                    <div className="text-sm text-dark font-medium mb-1">Productos:</div>
                    {order.resumen_productos ? (
                      <ul className="list-disc pl-5">
                        {order.resumen_productos.split(',').map((prod: string, idx: number) => (
                          <li key={idx}>{prod.trim()}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400 text-xs">Sin productos</div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <p className="text-sm font-medium text-gray">Total de la orden:</p>
                  <p className="font-extrabold text-primary text-xl">${Number(order.total_pago).toFixed(2)}</p>
                </div>

                {(order.estado === 'pendiente' || order.estado === 'en_revision') && (
                  <div className="mt-4 flex flex-col md:flex-row gap-2 justify-end">
                    <button
                      onClick={() => handleConfirmOrder(order.id)}
                      className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold disabled:opacity-60`}
                      disabled={actionLoading === order.id + '-confirm'}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {actionLoading === order.id + '-confirm' ? 'Confirmando...' : 'Confirmar Pago'}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingOrderId(order.id.toString());
                        setRejectNote('');
                      }}
                      className={`flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold disabled:opacity-60`}
                      disabled={actionLoading === order.id + '-reject'}
                    >
                      <XCircle className="h-4 w-4" />
                      {actionLoading === order.id + '-reject' ? 'Rechazando...' : 'Rechazar'}
                    </button>
                  </div>
                )}

                {/* Modal/campo para nota de rechazo */}
                {rejectingOrderId === order.id.toString() && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                      <h3 className="text-lg font-bold mb-2 text-dark">Rechazar orden #{order.id}</h3>
                      <label className="block text-sm font-medium mb-1">Motivo o nota para el alumno:</label>
                      <textarea
                        className="w-full border rounded p-2 mb-3 text-sm"
                        rows={3}
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                        placeholder="Ejemplo: El comprobante no es válido o no corresponde al monto."
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setRejectingOrderId(null)}
                          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                          disabled={actionLoading === order.id + '-reject'}
                        >Cancelar</button>
                        <button
                          onClick={() => handleRejectOrder(order.id, rejectNote)}
                          className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm font-semibold disabled:opacity-60"
                          disabled={!rejectNote.trim() || actionLoading === order.id + '-reject'}
                        >{actionLoading === order.id + '-reject' ? 'Rechazando...' : 'Rechazar orden'}</button>
                      </div>
                    </div>
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