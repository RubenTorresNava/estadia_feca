import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

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

type ReportTab = 'analysis' | 'clients';

export const AdminReports = () => {
  const { orders } = useCart();
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState<ReportTab>('analysis');

  // --- Lógica para los datos de los gráficos ---

  // 1. Ventas por categoría
  const salesByCategory = products.reduce((acc, product) => {
    acc[product.category] = 0;
    return acc;
  }, {} as { [key: string]: number });

  orders.forEach(order => {
    if (order.status === 'paid') {
      order.items.forEach(item => {
        if (salesByCategory[item.product.category] !== undefined) {
          salesByCategory[item.product.category] += item.product.price * item.quantity;
        }
      });
    }
  });

  const categoryChartData = {
    labels: Object.keys(salesByCategory),
    datasets: [
      {
        label: 'Ingresos por Categoría',
        data: Object.values(salesByCategory),
        backgroundColor: '#C73A3A',
        borderColor: '#6E2C2F',
        borderWidth: 1,
      },
    ],
  };

  // 2. Evolución de órdenes
  const ordersByDate = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const sortedDates = Object.keys(ordersByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const ordersChartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Órdenes Creadas por Día',
        data: sortedDates.map(date => ordersByDate[date]),
        fill: false,
        borderColor: '#C73A3A',
        tension: 0.1,
      },
    ],
  };

  const renderContent = () => {
    if (activeTab === 'analysis') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-dark mb-4">Ventas por Categoría</h3>
            <Bar data={categoryChartData} options={{ responsive: true }} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-dark mb-4">Evolución de Órdenes</h3>
            <Line data={ordersChartData} options={{ responsive: true }} />
          </div>
        </div>
      );
    }

    if (activeTab === 'clients') {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-dark mb-4">Resumen por Cliente</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray/20">
                  <th className="th-style">Cliente</th>
                  <th className="th-style">Método (Referencia)</th>
                  <th className="th-style">Total</th>
                  <th className="th-style">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice().reverse().map(order => (
                  <tr key={order.id} className="border-b border-gray/10">
                    <td className="td-style font-medium text-dark">
                      {/* En una app real, aquí iría el nombre del cliente */}
                      Usuario Anónimo
                    </td>
                    <td className="td-style text-gray font-mono">{order.reference}</td>
                    <td className="td-style text-dark font-semibold">${order.total.toFixed(2)}</td>
                    <td className="td-style">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.status === 'paid' ? 'Pagado' : order.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <div className="mb-6 border-b border-gray/20">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-3 px-4 font-medium text-sm ${activeTab === 'analysis' ? 'border-b-2 border-primary text-primary' : 'text-gray hover:text-dark'}`}
          >
            Análisis de Ventas
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`py-3 px-4 font-medium text-sm ${activeTab === 'clients' ? 'border-b-2 border-primary text-primary' : 'text-gray hover:text-dark'}`}
          >
            Clientes
          </button>
        </nav>
      </div>
      {orders.length > 0 ? (
        renderContent()
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <p className="text-gray">No hay suficientes datos para generar reportes.</p>
        </div>
      )}
      <style>{`
        .th-style { text-align: left; padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 600; color: #4A4A4D; }
        .td-style { padding: 0.75rem 1rem; font-size: 0.875rem; }
      `}</style>
    </div>
  );
};