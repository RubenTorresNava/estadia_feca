
import { useState, useEffect, useMemo } from 'react';
import { Package, Clock, DollarSign, CheckCircle, XCircle, AlertTriangle, Search, ReceiptText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import api from '../api/api';
import { formatCurrency } from '../utils/currency';


export const AdminSummary = () => {
  // 1. Hooks de Contexto (Siempre al inicio)
  const { orders, fetchOrders } = useCart();
  const { products } = useProducts();
  // Estados para resumen y alertas
  const [dashboard, setDashboard] = useState<any>(null);
  // Estado para modal/campo de rechazo
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Para loading de confirm/reject
  // Estados locales
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [previewComprobante, setPreviewComprobante] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setDashboard(res.data);
      } catch (err) {
        setDashboard(null);
      }
    };
    fetchDashboard();
  }, []);

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

  const handleMarkAsReady = async (orderId: string) => {
    setActionLoading(orderId + '-ready');
    try {
      await api.put(`/administrador/listo/${orderId}`);
      if (fetchOrders) await fetchOrders();
    } catch (err) {
      alert('Error al marcar la orden como lista.');
      console.error('Error al marcar la orden como lista:', err);
    } finally {
      setActionLoading(null);
    }
  };



  // 4. Datos de resumen y alertas
  const totalStock = products.reduce((sum, product) => sum + (Number(product.stock_actual) || 0), 0);
  const resumenContable = dashboard?.resumen_contable?.[0] || {};
  const totalPagadas = resumenContable.total_ordenes_pagadas || 0;
  const ingresosTotales = resumenContable.ingresos_totales || 0;
  const pagosPendientes = resumenContable.pagos_pendientes_revisar || 0;
  const alertasStock = dashboard?.alertas_stock || [];

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    const sortedOrders = orders.slice().reverse();

    if (!query) return sortedOrders;

    return sortedOrders.filter((order: any) => {
      const nombreAlumno = (order.usuario?.nombre || order.nombre_alumno || '').toString().toLowerCase();
      const matriculaAlumno = (order.usuario?.matricula || order.matricula || '').toString().toLowerCase();
      const numeroOrden = (order.id || order.orden_id || '').toString().toLowerCase();
      const folio = (order.folio_referencia || '').toString().toLowerCase();

      return (
        nombreAlumno.includes(query) ||
        matriculaAlumno.includes(query) ||
        numeroOrden.includes(query) ||
        folio.includes(query)
      );
    });
  }, [orders, orderSearch]);

  const getStatusMeta = (estado: string) => {
    if (estado === 'pagada') return { label: 'Pagada', style: 'bg-green-100 text-green-700 border-green-200' };
    if (estado === 'pendiente') return { label: 'Pendiente', style: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    if (estado === 'en_revision') return { label: 'En revision', style: 'bg-orange-100 text-orange-700 border-orange-200' };
    if (estado === 'rechazado') return { label: 'Rechazado', style: 'bg-red-100 text-red-700 border-red-200' };
    if (estado === 'cancelado') return { label: 'Cancelado', style: 'bg-slate-200 text-slate-700 border-slate-300' };
    if (estado === 'listo') return { label: 'Listo', style: 'bg-blue-100 text-blue-700 border-blue-200' };
    return { label: estado.charAt(0).toUpperCase() + estado.slice(1), style: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const ordersCount = orders.length;

  return (
    <>
      <section className="mb-6 rounded-2xl border border-black/5 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dark/45">Panel Administrativo</p>
            <h1 className="mt-1 text-2xl font-extrabold text-dark">Resumen operativo de FECA Store</h1>
            <p className="mt-1 text-sm text-dark/70">Monitorea ventas, pagos pendientes y actividad reciente desde un solo lugar.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-light/60 px-3 py-2 text-sm font-semibold text-dark/70">
            <ReceiptText className="h-4 w-4 text-primary" />
            {ordersCount} orden{ordersCount === 1 ? '' : 'es'} registradas
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="group bg-white rounded-2xl border border-black/5 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-dark/55">Productos</h3>
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-dark leading-none">{totalStock}</p>
          <p className="mt-2 text-sm text-dark/60">Stock total en catalogo</p>
        </div>

        <div className="group bg-white rounded-2xl border border-black/5 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-dark/55">Pagadas</h3>
            <div className="rounded-xl bg-green-100 p-2.5">
              <Clock className="h-5 w-5 text-green-700" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-dark leading-none">{totalPagadas}</p>
          <p className="mt-2 text-sm text-dark/60">Ordenes validadas</p>
        </div>

        <div className="group bg-white rounded-2xl border border-black/5 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-dark/55">Pendientes</h3>
            <div className="rounded-xl bg-yellow-100 p-2.5">
              <Clock className="h-5 w-5 text-yellow-700" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-dark leading-none">{pagosPendientes}</p>
          <p className="mt-2 text-sm text-dark/60">Comprobantes por revisar</p>
        </div>

        <div className="group bg-white rounded-2xl border border-black/5 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-dark/55">Ingresos</h3>
            <div className="rounded-xl bg-primary/10 p-2.5">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-dark leading-none">{formatCurrency(ingresosTotales)}</p>
          <p className="mt-2 text-sm text-dark/60">Ingreso confirmado acumulado</p>
        </div>
      </div>

      {/* Alertas de stock crítico */}
      {alertasStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded-xl flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-yellow-100 p-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-sm">
            <span className="font-bold text-yellow-800">¡Atención!</span> Hay productos con stock crítico:
            <ul className="list-disc pl-5 text-yellow-900 text-sm mt-1">
              {alertasStock.map((prod: any) => (
                <li key={prod.id}>{prod.nombre} (Stock: {prod.stock_actual})</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/5 shadow-md p-6 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-dark">Órdenes Recientes</h2>
            <p className="text-sm text-dark/60 mt-1">Seguimiento de pedidos con acciones rápidas para aprobación.</p>
          </div>

          <div className="w-full md:w-80 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Busqueda rápida..."
              className="w-full rounded-xl border border-gray/30 bg-white pl-9 pr-3 py-2 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray/40 text-gray text-center py-10">
            No hay órdenes registradas por ahora.
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray/40 text-gray text-center py-10">
            No se encontraron órdenes con ese criterio de búsqueda.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: any) => (
              <div key={order.id} className="border border-gray/20 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold text-dark text-xl">Orden #{order.id}</p>
                      <span className="text-xs rounded-full bg-light px-2 py-1 text-dark/60 font-semibold">Ref: {order.folio_referencia}</span>
                    </div>
                    <p className="text-sm text-dark/75 mt-1">{order.usuario?.nombre || order.nombre_alumno} · {order.usuario?.correo || order.correo || 'Sin correo'}</p>
                    <p className="text-xs text-dark/55 mt-0.5">Matrícula: {order.usuario?.matricula || order.matricula || 'N/A'}</p>

                    {(() => {
                      const status = getStatusMeta(order.estado);
                      return (
                        <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${status.style}`}>
                          {status.label}
                        </span>
                      );
                    })()}

                    <span
                      className="sr-only"
                    >
                      Estado
                    </span>
                    {order.estado === 'rechazado' && order.nota_admin && (
                      <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Motivo enviado al alumno</p>
                        <p className="text-sm text-red-800 mt-1">{order.nota_admin}</p>
                      </div>
                    )}
                    <button
                      onClick={() => toggleOrder(order.id.toString())}
                      className="inline-flex mt-3 items-center text-primary text-xs font-bold hover:underline"
                    >
                      {expandedOrderId === order.id.toString() ? 'Ocultar detalles ▲' : 'Ver productos ▼'}
                    </button>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-2 md:w-64 w-full">
                    {/* <label className="flex items-center gap-1 cursor-pointer text-xs text-blue-700 hover:underline">
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
                    </label> */}
                    {order.comprobante_url && (
                      <div className="flex flex-col items-center md:items-end mt-2 w-full">
                        <img
                          src={order.comprobante_url}
                          alt="Comprobante actual"
                          className="w-full max-w-xs md:max-w-xs object-contain rounded border cursor-zoom-in"
                          onClick={() => setPreviewComprobante(order.comprobante_url)}
                        />
                        <span className="text-xs text-gray-500">Comprobante actual</span>
                      </div>
                    )}
                  </div>
                </div>

                {expandedOrderId === order.id.toString() && (
                  <div className="mt-3 bg-gray-50 rounded-md p-3 border-l-4 border-primary">
                    <div className="text-sm text-dark font-medium mb-1">Productos:</div>
                    {order.detalles && order.detalles.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {order.detalles.map((detalle: any, idx: number) => (
                          <li key={idx}>
                            {detalle.producto?.nombre || 'Producto'} x{detalle.cantidad} - {formatCurrency(detalle.precio_unitario)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400 text-xs">Sin productos</div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/10">
                  <p className="text-sm font-semibold text-dark/55">Total de la orden</p>
                  <p className="font-extrabold text-primary text-2xl">{formatCurrency(order.total_pago)}</p>
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

                {order.estado === 'pagada' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleMarkAsReady(order.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-60"
                      disabled={actionLoading === order.id + '-ready'}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {actionLoading === order.id + '-ready' ? 'Marcando...' : 'LISTO'}
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

      {previewComprobante && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8"
          onClick={() => setPreviewComprobante(null)}
        >
          <div className="relative max-h-full max-w-5xl w-full flex items-center justify-center">
            <button
              type="button"
              onClick={() => setPreviewComprobante(null)}
              className="absolute -top-3 -right-3 z-10 h-10 w-10 rounded-full bg-white text-dark shadow-lg hover:bg-gray-100"
              aria-label="Cerrar vista previa"
            >
              ×
            </button>
            <img
              src={previewComprobante}
              alt="Vista ampliada del comprobante"
              className="max-h-[85vh] max-w-full rounded-lg bg-white object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};