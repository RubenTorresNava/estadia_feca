import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
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

export const AdminReports = () => {
  const { orders } = useCart();
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState<ReportTab>("analysis");
  const [search, setSearch] = useState("");

  // Filtrado de órdenes general (para ambos tabs)
  const filteredOrders = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return orders.filter(
      (order) =>
        !lower ||
        order.id?.toString().includes(lower) ||
        order.nombre_alumno?.toLowerCase().includes(lower) ||
        order.matricula?.toLowerCase().includes(lower) ||
        order.correo?.toLowerCase().includes(lower) ||
        order.estado?.toLowerCase().includes(lower) ||
        order.fecha_creacion?.toLowerCase().includes(lower) ||
        order.total_pago?.toString().includes(lower)
    );
  }, [orders, search]);

  // --- 1. Lógica para Ventas por Categoría ---
  const salesByCategory = products.reduce((acc, product) => {
    if (product.categoria) {
      acc[product.categoria] = 0;
    }
    return acc;
  }, {} as { [key: string]: number });

  orders.forEach((order) => {
    if (order.estado === "pagada") {
      order.detalles?.forEach((detalle: any) => {
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
        label: "Ingresos por Categoría ($)",
        data: Object.values(salesByCategory),
        backgroundColor: "#C73A3A",
        borderColor: "#6E2C2F",
        borderWidth: 1,
      },
    ],
  };

  // --- 2. Evolución de órdenes ---
  const ordersByDate = orders.reduce((acc, order) => {
    const date = new Date(order.fecha_creacion).toLocaleDateString();
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
                placeholder="Buscar orden por ID, alumno, correo, estado, fecha..."
                onSearch={setSearch}
                className="sm:w-72 w-full"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray/20 text-left">
                    <th className="p-3 text-sm font-bold text-gray-600">ID</th>
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
                        <td className="p-3 text-sm">{order.id}</td>
                        <td className="p-3 text-sm">
                          <p className="font-bold text-dark">{order.nombre_alumno}</p>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{order.matricula}</td>
                        <td className="p-3 text-sm text-gray-600">{order.correo}</td>
                        <td className="p-3 text-sm text-gray-600">{order.fecha_creacion}</td>
                        <td className="p-3 text-sm font-bold text-primary">
                          ${Number(order.total_pago).toFixed(2)}
                        </td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            order.estado === "pagada" ? "bg-green-100 text-green-700" : 
                            order.estado === "pendiente" ? "bg-yellow-100 text-yellow-700" : 
                            "bg-red-100 text-red-700"
                          }`}>
                            {order.estado}
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
              placeholder="Buscar alumno, matrícula, correo o estado..."
              onSearch={setSearch}
              className="sm:w-72 w-full"
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
                        <p className="font-bold text-dark">{order.nombre_alumno}</p>
                        <p className="text-xs text-gray">{order.correo}</p>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{order.matricula}</td>
                      <td className="p-3 text-sm font-bold text-primary">
                        ${Number(order.total_pago).toFixed(2)}
                      </td>
                      <td className="p-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          order.estado === "pagada" ? "bg-green-100 text-green-700" : 
                          order.estado === "pendiente" ? "bg-yellow-100 text-yellow-700" : 
                          "bg-red-100 text-red-700"
                        }`}>
                          {order.estado}
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
      {orders.length > 0 ? renderContent() : (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-200">
          <p className="text-gray font-medium">No hay órdenes registradas para generar reportes.</p>
        </div>
      )}
    </div>
  );
};