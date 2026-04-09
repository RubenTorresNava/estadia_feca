import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import { ComprobanteUpload } from '../components/ComprobanteUpload';
import { formatCurrency } from '../utils/currency';
import { resolveMediaUrl } from '../utils/media';
import { Package, LogOut } from 'lucide-react';

interface HistoryProps {
  onLogout: () => void;
}

interface Pedido {
  id: number;
  orden_id?: number;
  usuario_id: number;
  total_pago: number;
  estado: string;
  nota_admin?: string | null;
  fecha_creacion: string;
  comprobante_url: string | null;
  folio_referencia?: string;
}

export const History = ({ onLogout }: HistoryProps) => {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewComprobante, setPreviewComprobante] = useState<string | null>(null);

  const estadoMeta = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return { label: 'PENDIENTE DE PAGO' };
      case 'en_revision':
        return { label: 'EN REVISION' };
      case 'pagada':
        return { label: 'PAGADA' };
      case 'listo':
        return { label: 'LISTA PARA ENTREGA' };
      case 'rechazado':
        return { label: 'PAGO RECHAZADO' };
      case 'cancelado':
        return { label: 'PEDIDO CANCELADO' };
      default:
        return { label: estado.toUpperCase() };
    }
  };

  const ordenes = useMemo(() => {
    return pedidos.slice().sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
  }, [pedidos]);

  const pendientes = useMemo(() => {
    return ordenes.filter((p) => p.estado === 'pendiente' || p.estado === 'en_revision').length;
  }, [ordenes]);

  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/alumno/pedidos');
        const pedidosNormalizados = res.data.map((pedido: Pedido) => ({
          ...pedido,
          id: pedido.id ?? pedido.orden_id,
          comprobante_url: resolveMediaUrl(pedido.comprobante_url),
        }));
        setPedidos(pedidosNormalizados);
      } catch (err) {
        setError('No se pudieron cargar tus pedidos.');
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const handleUpload = async (ordenId: number, file: File) => {
    if (!ordenId) {
      throw new Error('No se encontró el ID de la orden.');
    }

    const formData = new FormData();
    formData.append('comprobante', file);
    await api.post(`/alumno/comprobante/${ordenId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Refrescar pedidos para mostrar el comprobante subido
    const res = await api.get('/alumno/pedidos');
    const pedidosNormalizados = res.data.map((pedido: Pedido) => ({
      ...pedido,
      id: pedido.id ?? pedido.orden_id,
      comprobante_url: resolveMediaUrl(pedido.comprobante_url),
    }));
    setPedidos(pedidosNormalizados);
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-4xl font-extrabold text-dark inline-flex items-center gap-2 leading-tight">
              Hola, {usuario?.nombre}
            </h1>
            <p className="mt-2 text-lg text-dark/70">Aqui tienes el resumen de tus compras y estados de pago.</p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-dark shadow-sm transition hover:bg-light sm:h-auto sm:w-auto sm:rounded-xl sm:px-4 sm:py-2.5"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline sm:ml-2 sm:text-sm sm:font-semibold">Salir</span>
          </button>
        </div>

        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-extrabold text-dark inline-flex items-center gap-2">
              <Package className="h-7 w-7 text-primary" />
              Mis pedidos
            </h2>
            <span className="rounded-lg bg-white/80 px-3 py-1 text-sm font-semibold text-dark/60 border border-black/5">
              {pendientes} pedido{pendientes === 1 ? '' : 's'} pendiente{pendientes === 1 ? '' : 's'}
            </span>
          </div>

        {loading ? (
          <div className="text-center py-10 text-dark/70">Cargando tus pedidos...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-center py-8 px-4">{error}</div>
        ) : pedidos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray/40 text-center py-12 text-dark/60">
            Aún no tienes pedidos registrados.
          </div>
        ) : (
          <div className="space-y-6">
            {ordenes.map((pedido) => {
              const meta = estadoMeta(pedido.estado);

              return (
              <div key={pedido.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="border-b border-black/10 px-6 py-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-dark/35">Folio</p>
                        <p className="text-2xl font-extrabold text-dark mt-1">{pedido.folio_referencia || pedido.id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-dark/35">Fecha</p>
                        <p className="text-2xl font-semibold text-dark mt-1">
                          {new Date(pedido.fecha_creacion).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center self-start rounded-full px-4 py-2 text-xs font-extrabold tracking-wide ${
                      pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800'
                      : pedido.estado === 'en_revision' ? 'bg-orange-100 text-orange-800'
                      : pedido.estado === 'pagada' ? 'bg-blue-100 text-blue-800'
                      : pedido.estado === 'listo' ? 'bg-green-100 text-green-800'
                      : pedido.estado === 'rechazado' ? 'bg-red-100 text-red-800'
                      : pedido.estado === 'cancelado' ? 'bg-slate-200 text-slate-700'
                      : 'bg-gray-100 text-gray-700'
                    }`}>
                      {meta.label}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-[1.15fr_1fr]">
                  <div className="space-y-5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-dark/70">Monto total:</span>
                      <span className="text-5xl font-extrabold text-dark">{formatCurrency(pedido.total_pago)}</span>
                      <span className="font-semibold text-dark/35">MXN</span>
                    </div>

                    <div className="rounded-xl border border-black/5 bg-light/70 px-4 py-4 text-xl italic text-dark/80">
                      {pedido.estado === 'cancelado'
                        ? '"Tu pedido se canceló automáticamente por no recibir comprobante en el tiempo establecido."'
                        : pedido.estado === 'rechazado' && pedido.nota_admin
                        ? `"${pedido.nota_admin}"`
                        : '"Por favor, sube una foto clara del comprobante de pago para procesar tu pedido."'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/5 bg-white p-4">
                    {pedido.comprobante_url ? (
                      <div className="space-y-3">
                        <p className="text-center text-2xl font-extrabold text-dark">Comprobante enviado</p>
                        <img
                          src={pedido.comprobante_url}
                          alt="Comprobante"
                          className="mx-auto w-full max-h-64 rounded-xl border border-black/10 object-contain bg-light/30 cursor-zoom-in"
                          onClick={() => setPreviewComprobante(pedido.comprobante_url)}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewComprobante(pedido.comprobante_url)}
                          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 font-semibold text-dark hover:bg-light"
                        >
                          Ver comprobante
                        </button>
                      </div>
                    ) : (
                      <ComprobanteUpload
                        ordenId={pedido.id}
                        onUpload={async (file) => await handleUpload(pedido.id, file)}
                      />
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
        </div>
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
    </div>
  );
};
