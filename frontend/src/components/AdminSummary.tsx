import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { Package, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Order } from '../../types';

export const AdminSummary = () => {
  const { orders, confirmOrder } = useCart();

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await confirmOrder(orderId);
    } catch (err) {
      console.error('Error al confirmar la orden:', err);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Productos</h3>
          </div>
          <p className="text-3xl font-bold text-dark">{products.length}</p>
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
            {orders
              .slice()
              .reverse()
              .map((order: Order) => (
                <div key={order.id} className="border border-gray/20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-dark">{order.id}</p>
                      <p className="text-sm text-gray">Referencia: {order.reference}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {order.status === 'paid'
                        ? 'Pagado'
                        : order.status === 'pending'
                        ? 'Pendiente'
                        : 'Cancelado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray">{order.items.length} producto(s)</p>
                    <p className="font-bold text-primary">${order.total.toFixed(2)}</p>
                  </div>
                  {order.status === 'pending' && (
                    <div className="mt-4 border-t border-gray/10 pt-4 flex justify-end">
                      <button
                        onClick={() => handleConfirmOrder(order.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Confirmar Pago
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