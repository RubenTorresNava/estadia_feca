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
    <div className="min-h-screen bg-light flex flex-col items-center py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl text-center mb-8">
        <h1 className="text-2xl font-bold text-dark mb-4">¡Bienvenido, {usuario?.nombre}!</h1>
        <p className="mb-6">
          {/* Has iniciado sesión como <span className="font-semibold text-primary">alumno</span>.<br/> */}
          Aquí puedes ver tus compras y subir comprobantes de pago.
        </p>
        <button
          onClick={onLogout}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors mt-4"
        >
          Cerrar sesión
        </button>
      </div>
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-bold text-dark mb-4 text-left">Mis pedidos</h2>
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-8">No tienes pedidos registrados.</div>
        ) : (
          <div className="space-y-6">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-100">
                <div className="flex-1 text-left">
                  <div className="font-semibold text-dark">Folio: {pedido.folio_referencia || pedido.id}</div>
                  <div className="text-sm text-gray-600">Estado: 
                    <span
                      className={`font-medium px-2 py-1 rounded-full text-xs
                        ${pedido.estado === 'pagada' ? 'bg-green-100 text-green-700'
                        : pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700'
                        : pedido.estado === 'en_revision' ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'}
                      `}
                    >
                      {pedido.estado === 'pagada'
                        ? 'Pagada'
                        : pedido.estado === 'pendiente'
                        ? 'Pendiente'
                        : pedido.estado === 'en_revision'
                        ? 'En revisión'
                        : pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Total: ${Number(pedido.total_pago).toFixed(2)}</div>
                  <div className="text-xs text-gray-400">Fecha: {new Date(pedido.fecha_creacion).toLocaleString()}</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {pedido.comprobante_url ? (
                    <>
                      <img
                        src={pedido.comprobante_url}
                        alt="Comprobante"
                        className="w-full max-w-xs md:max-w-md object-contain rounded border cursor-zoom-in"
                        onClick={() => setPreviewComprobante(pedido.comprobante_url)}
                      />
                      <span className="text-xs text-green-600">Comprobante enviado</span>
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
