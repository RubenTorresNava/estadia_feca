import { useState, useMemo, useEffect } from "react";
import { useProducts } from "../context/ProductContext";
import api from "../api/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { SearchBar } from "./SearchBar";
import { Bar, Line } from "react-chartjs-2";
import { formatCurrency } from "../utils/currency";
import { BarChart3, Users, ReceiptText, Clock4 } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);


type ReportTab = "analysis" | "clients";

interface OrderDetail {
  precio_unitario: number | string;
  cantidad: number;
  producto?: {
    categoria?: string;
  };
}

interface Order {
  id: number | string;
  usuario?: {
    nombre?: string;
    matricula?: string;
    correo?: string;
  };
  estado?: string;
  fecha_creacion?: string;
  total_pago?: number | string;
  detalles?: OrderDetail[];
}

export const AdminReports = () => {
  const { products } = useProducts();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<ReportTab>("analysis");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      try {
        const res = await api.get("/administrador/historial");
        setOrders(res.data);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, []);

  // Filtrado de órdenes general (para ambos tabs) por campo
  const filteredOrders = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (!lower) return true;
      if (filter === 'nombre_alumno') return order.usuario?.nombre?.toLowerCase().includes(lower);
      if (filter === 'matricula') return order.usuario?.matricula?.toLowerCase().includes(lower);
      if (filter === 'correo') return order.usuario?.correo?.toLowerCase().includes(lower);
      if (filter === 'estado') return order.estado?.toLowerCase().includes(lower);
      if (filter === 'fecha_creacion') return order.fecha_creacion?.toLowerCase().includes(lower);
      if (filter === 'total_pago') return order.total_pago?.toString().includes(lower);
      return false;
    });
  }, [orders, search, filter]);

  const salesByCategory = products.reduce((acc, product) => {
    if (product.categoria) {
      acc[product.categoria] = 0;
    }
    return acc;
  }, {} as { [key: string]: number });

  orders.forEach((order) => {
    if (order.estado === "pagada" || order.estado === "listo") {
      order.detalles?.forEach((detalle) => {
        const cat = detalle.producto?.categoria;
        if (cat && salesByCategory[cat] !== undefined) {
          salesByCategory[cat] += Number(detalle.precio_unitario) * detalle.cantidad;
        }
      });
    }
  });

  const categoryChartData = {
    labels: Object.keys(salesByCategory),
    datasets: [
      {
        label: "Ingresos por Categoría (MXN)",
        data: Object.values(salesByCategory),
        backgroundColor: "#C73A3A",
        borderColor: "#6E2C2F",
        borderWidth: 1,
      },
    ],
  };

  // --- 2. Evolución de órdenes ---
  const ordersByDate = orders.reduce((acc, order) => {
    if (!order.fecha_creacion) return acc;

    const parsedDate = new Date(order.fecha_creacion);
    if (Number.isNaN(parsedDate.getTime())) return acc;

    const date = parsedDate.toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const sortedDates = Object.keys(ordersByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const ordersChartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Órdenes Totales por Día",
        data: sortedDates.map((date) => ordersByDate[date]),
        fill: true,
        backgroundColor: "rgba(199, 58, 58, 0.1)",
        borderColor: "#C73A3A",
        tension: 0.4,
      },
    ],
  };

  const ordersChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#4A4A4D',
          boxWidth: 18,
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(74, 74, 77, 0.08)',
        },
      },
      y: {
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(74, 74, 77, 0.08)',
        },
      },
    },
  } as const;

  const confirmedOrders = useMemo(
    () => orders.filter((o) => o.estado === 'pagada' || o.estado === 'listo'),
    [orders]
  );

  const totalIngresos = useMemo(
    () => confirmedOrders.reduce((sum, o) => sum + Number(o.total_pago || 0), 0),
    [confirmedOrders]
  );

  const alumnosUnicos = useMemo(() => {
    const keys = new Set(
      orders.map((o) => o.usuario?.matricula || o.usuario?.correo || o.usuario?.nombre).filter(Boolean)
    );
    return keys.size;
  }, [orders]);

  const enRevision = useMemo(
    () => orders.filter((o) => o.estado === 'en_revision').length,
    [orders]
  );

  const getStatusMeta = (estado?: string) => {
    if (estado === 'pagada') return { label: 'Pagada', style: 'bg-green-100 text-green-700' };
    if (estado === 'pendiente') return { label: 'Pendiente', style: 'bg-yellow-100 text-yellow-700' };
    if (estado === 'en_revision') return { label: 'En revisión', style: 'bg-orange-100 text-orange-700' };
    if (estado === 'listo') return { label: 'Listo', style: 'bg-blue-100 text-blue-700' };
    if (estado === 'rechazado') return { label: 'Rechazado', style: 'bg-red-100 text-red-700' };
    if (estado === 'cancelado') return { label: 'Cancelado', style: 'bg-slate-200 text-slate-700' };
    return { label: estado || 'N/A', style: 'bg-gray-100 text-gray-700' };
  };

  const renderContent = () => {
    if (activeTab === "analysis") {
      return (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4">
              <p className="text-xs uppercase tracking-wide text-dark/50 font-semibold">Órdenes</p>
              <p className="text-3xl font-extrabold text-dark mt-1">{orders.length}</p>
              <p className="text-xs text-dark/55 mt-1">Registradas en sistema</p>
            </div>
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4">
              <p className="text-xs uppercase tracking-wide text-dark/50 font-semibold">Ingresos</p>
              <p className="text-2xl font-extrabold text-dark mt-1">{formatCurrency(totalIngresos)}</p>
              <p className="text-xs text-dark/55 mt-1">Pagadas y listas</p>
            </div>
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4">
              <p className="text-xs uppercase tracking-wide text-dark/50 font-semibold">Alumnos</p>
              <p className="text-3xl font-extrabold text-dark mt-1">{alumnosUnicos}</p>
              <p className="text-xs text-dark/55 mt-1">Con actividad</p>
            </div>
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4">
              <p className="text-xs uppercase tracking-wide text-dark/50 font-semibold">En revisión</p>
              <p className="text-3xl font-extrabold text-dark mt-1">{enRevision}</p>
              <p className="text-xs text-dark/55 mt-1">Pagos pendientes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Ventas por Categoría</h3>
              <div className="h-[300px]">
                <Bar data={categoryChartData} options={ordersChartOptions} />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Evolución de Órdenes</h3>
              <div className="h-[300px]">
                <Line data={ordersChartData} options={ordersChartOptions} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-dark">Órdenes Recientes</h3>
              <SearchBar
                placeholder="Buscar..."
                onSearch={(q, f) => { setSearch(q); setFilter(f); }}
                className="sm:w-72 w-full"
                options={[
                  { value: 'nombre_alumno', label: 'Alumno' },
                  { value: 'matricula', label: 'Matrícula' },
                  { value: 'correo', label: 'Correo' },
                  { value: 'estado', label: 'Estado' },
                  { value: 'fecha_creacion', label: 'Fecha' },
                  { value: 'total_pago', label: 'Total' },
                ]}
                defaultFilter="nombre_alumno"
              />
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray/15">
              <table className="w-full">
                <thead className="bg-light/60">
                  <tr className="border-b border-gray/20 text-left">
                    {/* <th className="p-3 text-sm font-bold text-gray-600">ID</th> */}
                    <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Alumno</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Matrícula</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Correo</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Fecha</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Total</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-dark/55">No hay órdenes que coincidan con la búsqueda.</td>
                    </tr>
                  ) : (
                    filteredOrders.slice().reverse().map((order) => (
                      <tr key={order.id} className="border-b border-gray/10 hover:bg-light/35 transition-colors">
                        {/* <td className="p-3 text-sm">{order.id}</td> */}
                        <td className="p-3 text-sm">
                          <p className="font-bold text-dark">{order.usuario?.nombre}</p>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{order.usuario?.matricula}</td>
                        <td className="p-3 text-sm text-gray-600">{order.usuario?.correo}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {order.fecha_creacion
                            ? new Date(order.fecha_creacion).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </td>
                        <td className="p-3 text-sm font-bold text-primary">
                          {formatCurrency(order.total_pago)}
                        </td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusMeta(order.estado).style}`}>
                            {getStatusMeta(order.estado).label}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === "clients") {
      return (
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
          <h3 className="text-lg font-bold text-dark mb-4">Resumen de Alumnos</h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <SearchBar
              placeholder="Buscar..."
              onSearch={(q, f) => { setSearch(q); setFilter(f); }}
              className="sm:w-72 w-full"
              options={[
                { value: 'nombre_alumno', label: 'Alumno' },
                { value: 'matricula', label: 'Matrícula' },
                { value: 'correo', label: 'Correo' },
              ]}
              defaultFilter="nombre_alumno"
            />
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray/15">
            <table className="w-full">
              <thead className="bg-light/60">
                <tr className="border-b border-gray/20 text-left">
                  <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Alumno</th>
                  <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Matrícula</th>
                  <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Total</th>
                  <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-dark/55">No hay órdenes que coincidan con la búsqueda.</td>
                  </tr>
                ) : (
                  filteredOrders.slice().reverse().map((order) => (
                    <tr key={order.id} className="border-b border-gray/10 hover:bg-light/35 transition-colors">
                      <td className="p-3 text-sm">
                        <p className="font-bold text-dark">{order.usuario?.nombre}</p>
                        <p className="text-xs text-gray">{order.usuario?.correo}</p>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{order.usuario?.matricula}</td>
                      <td className="p-3 text-sm font-bold text-primary">
                        {formatCurrency(order.total_pago)}
                      </td>
                      <td className="p-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusMeta(order.estado).style}`}>
                          {getStatusMeta(order.estado).label}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <section className="mb-5 rounded-2xl border border-black/5 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dark/45">Reportes</p>
            <h2 className="mt-1 text-2xl font-extrabold text-dark inline-flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Centro de análisis
            </h2>
            <p className="mt-1 text-sm text-dark/60">Visualiza tendencias, comportamiento de órdenes y actividad de alumnos.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-black/10 bg-light/60 px-3 py-2 text-center">
              <p className="text-[11px] uppercase tracking-wide text-dark/50 font-semibold">Órdenes</p>
              <p className="text-xl font-extrabold text-dark inline-flex items-center gap-1 justify-center"><ReceiptText className="h-4 w-4 text-primary" />{orders.length}</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-light/60 px-3 py-2 text-center">
              <p className="text-[11px] uppercase tracking-wide text-dark/50 font-semibold">Alumnos</p>
              <p className="text-xl font-extrabold text-dark inline-flex items-center gap-1 justify-center"><Users className="h-4 w-4 text-primary" />{alumnosUnicos}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 border-b border-gray/20">
        <nav className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`py-2.5 px-4 rounded-xl font-bold text-sm transition-colors ${activeTab === "analysis" ? "bg-primary/10 text-primary" : "text-gray hover:text-dark hover:bg-light"}`}
          >
            <span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4" />Análisis de Ventas</span>
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`py-2.5 px-4 rounded-xl font-bold text-sm transition-colors ${activeTab === "clients" ? "bg-primary/10 text-primary" : "text-gray hover:text-dark hover:bg-light"}`}
          >
            <span className="inline-flex items-center gap-2"><Clock4 className="h-4 w-4" />Lista de Alumnos</span>
          </button>
        </nav>
      </div>
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200">
          <p className="text-gray font-medium">Cargando reportes...</p>
        </div>
      ) : orders.length > 0 ? (
        renderContent()
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200">
          <p className="text-gray font-medium">No hay órdenes registradas para generar reportes.</p>
        </div>
      )}
    </div>
  );
};