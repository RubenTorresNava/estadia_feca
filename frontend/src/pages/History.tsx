import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/api';
import { ComprobanteUpload } from '../components/ComprobanteUpload';

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

  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/alumno/pedidos');
        const pedidosNormalizados = res.data.map((pedido: Pedido) => ({
          ...pedido,
          id: pedido.id ?? pedido.orden_id,
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
    setPedidos(res.data);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white p-8 text-center shadow-lg">
          <div className="pointer-events-none absolute -top-16 -left-14 h-44 w-44 rounded-full bg-primary/10 blur-2xl" />
          <div className="pointer-events-none absolute -right-14 -bottom-16 h-44 w-44 rounded-full bg-primary/10 blur-2xl" />

          <h1 className="relative text-3xl font-extrabold text-dark mb-3">Hola, {usuario?.nombre}</h1>
          <p className="relative text-dark/80 mb-6 max-w-2xl mx-auto">
            Consulta el estado de tus compras y sube tu comprobante cuando el pedido esté pendiente.
          </p>
          <button
            onClick={onLogout}
            className="relative inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-2xl font-extrabold text-dark">Mis pedidos</h2>
            <span className="text-sm rounded-full bg-light px-3 py-1 font-semibold text-dark/70">
              {pedidos.length} registro{pedidos.length === 1 ? '' : 's'}
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
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="rounded-2xl border border-black/10 bg-white p-4 md:p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs uppercase tracking-wide font-semibold text-dark/50">Folio</span>
                    <span className="font-bold text-dark">{pedido.folio_referencia || pedido.id}</span>
                  </div>

                  <div className="text-sm text-dark/80 flex items-center gap-2">Estado:
                    <span
                      className={`font-semibold px-2.5 py-1 rounded-full text-xs
                        ${pedido.estado === 'pagada' ? 'bg-green-100 text-green-700'
                        : pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700'
                        : pedido.estado === 'en_revision' ? 'bg-orange-100 text-orange-700'
                        : pedido.estado === 'rechazado' ? 'bg-red-100 text-red-700'
                        : pedido.estado === 'listo' ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'}
                      `}
                    >
                      {pedido.estado === 'pagada'
                        ? 'Pagada'
                        : pedido.estado === 'pendiente'
                        ? 'Pendiente'
                        : pedido.estado === 'en_revision'
                        ? 'En revisión'
                        : pedido.estado === 'rechazado'
                        ? 'Rechazado'
                        : pedido.estado === 'listo'
                        ? 'Listo para entrega'
                        : pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                    </span>
                  </div>
                  {pedido.estado === 'rechazado' && pedido.nota_admin && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Motivo del rechazo</p>
                      <p className="text-sm text-red-800 mt-1">{pedido.nota_admin}</p>
                    </div>
                  )}
                  <div className="mt-3 text-sm text-dark/80">Total: <span className="font-bold text-primary">${Number(pedido.total_pago).toFixed(2)}</span></div>
                  <div className="text-xs text-dark/50 mt-1">Fecha: {new Date(pedido.fecha_creacion).toLocaleString()}</div>
                </div>

                <div className="flex flex-col items-stretch md:items-end gap-2 md:w-[340px]">
                  {pedido.comprobante_url ? (
                    <>
                      <img
                        src={pedido.comprobante_url}
                        alt="Comprobante"
                        className="w-full max-w-xs md:max-w-md max-h-56 object-contain rounded-lg border border-black/10 cursor-zoom-in bg-light/50"
                        onClick={() => setPreviewComprobante(pedido.comprobante_url)}
                      />
                      <span className="text-xs text-green-700 font-semibold">Comprobante enviado</span>
                    </>
                  ) : (
                    <ComprobanteUpload
                      ordenId={pedido.id}
                      onUpload={async (file) => await handleUpload(pedido.id, file)}
                    />
                  )}
                </div>
              </div>
            ))}
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
