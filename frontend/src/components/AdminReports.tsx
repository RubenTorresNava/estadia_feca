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

  const renderContent = () => {
    if (activeTab === "analysis") {
      return (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Ventas por Categoría</h3>
              <div className="h-[300px]">
                <Bar data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Evolución de Órdenes</h3>
              <div className="h-[300px]">
                <Line data={ordersChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray/20 text-left">
                    {/* <th className="p-3 text-sm font-bold text-gray-600">ID</th> */}
                    <th className="p-3 text-sm font-bold text-gray-600">Alumno</th>
                    <th className="p-3 text-sm font-bold text-gray-600">Matrícula</th>
                    <th className="p-3 text-sm font-bold text-gray-600">Correo</th>
                    <th className="p-3 text-sm font-bold text-gray-600">Fecha</th>
                    <th className="p-3 text-sm font-bold text-gray-600">Total</th>
                    <th className="p-3 text-sm font-bold text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray">No hay órdenes que coincidan con la búsqueda.</td>
                    </tr>
                  ) : (
                    filteredOrders.slice().reverse().map((order) => (
                      <tr key={order.id} className="border-b border-gray/5 hover:bg-gray-50">
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
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            order.estado === "pagada"
                              ? "bg-green-100 text-green-700"
                              : order.estado === "pendiente"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.estado === "en_revision"
                              ? "bg-orange-100 text-orange-700"
                              : order.estado === "listo"
                              ? "bg-blue-100 text-blue-700"
                              : order.estado === "rechazado"
                              ? "bg-red-200 text-red-700"
                              : order.estado === "cancelado"
                              ? "bg-gray-200 text-gray-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {order.estado === "pagada"
                              ? "Pagada"
                              : order.estado === "pendiente"
                              ? "Pendiente"
                              : order.estado === "en_revision"
                              ? "En revisión"
                              : order.estado === "listo"
                              ? "Listo"
                              : order.estado === "rechazado"
                              ? "Rechazada"
                              : order.estado === "cancelado"
                              ? "Cancelada"
                              : order.estado}
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
        <div className="bg-white rounded-lg shadow-md p-6">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray/20 text-left">
                  <th className="p-3 text-sm font-bold text-gray-600">Alumno</th>
                  <th className="p-3 text-sm font-bold text-gray-600">Matrícula</th>
                  <th className="p-3 text-sm font-bold text-gray-600">Total</th>
                  <th className="p-3 text-sm font-bold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray">No hay órdenes que coincidan con la búsqueda.</td>
                  </tr>
                ) : (
                  filteredOrders.slice().reverse().map((order) => (
                    <tr key={order.id} className="border-b border-gray/5 hover:bg-gray-50">
                      <td className="p-3 text-sm">
                        <p className="font-bold text-dark">{order.usuario?.nombre}</p>
                        <p className="text-xs text-gray">{order.usuario?.correo}</p>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{order.usuario?.matricula}</td>
                      <td className="p-3 text-sm font-bold text-primary">
                        {formatCurrency(order.total_pago)}
                      </td>
                      <td className="p-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          order.estado === "pagada" ? "bg-green-100 text-green-700" : 
                          order.estado === "pendiente" ? "bg-yellow-100 text-yellow-700" : 
                          order.estado === "en_revision" ? "bg-orange-100 text-orange-700" : 
                          order.estado === "listo" ? "bg-blue-100 text-blue-700" : 
                          order.estado === "rechazado" ? "bg-red-100 text-red-700" : 
                          order.estado === "cancelado" ? "bg-slate-200 text-slate-700" : 
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {order.estado === "cancelado" ? "Cancelado" : order.estado}
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
      <div className="mb-6 border-b border-gray/20">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`py-3 px-4 font-bold text-sm transition-colors ${activeTab === "analysis" ? "border-b-2 border-primary text-primary" : "text-gray hover:text-dark"}`}
          >
            Análisis de Ventas
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`py-3 px-4 font-bold text-sm transition-colors ${activeTab === "clients" ? "border-b-2 border-primary text-primary" : "text-gray hover:text-dark"}`}
          >
            Lista de Alumnos
          </button>
        </nav>
      </div>
      {loading ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-200">
          <p className="text-gray font-medium">Cargando reportes...</p>
        </div>
      ) : orders.length > 0 ? (
        renderContent()
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-200">
          <p className="text-gray font-medium">No hay órdenes registradas para generar reportes.</p>
        </div>
      )}
    </div>
  );
};