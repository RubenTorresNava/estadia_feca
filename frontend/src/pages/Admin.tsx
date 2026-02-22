import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { LogOut, Package, DollarSign, Clock } from 'lucide-react';
import { products } from '../data/products';

interface AdminProps {
  onNavigate: (page: string) => void;
}

export const Admin = ({ onNavigate }: AdminProps) => {
  const { isAdmin, login, logout } = useAuth();
  const { orders } = useCart();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      setError('');
      setPassword('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <img src="/fecastor.png" alt="FECA" className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold text-dark text-center mb-6">
            Panel de Administración
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ingresa la contraseña"
              />
              {error && <p className="text-primary text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>
          <p className="text-xs text-gray text-center mt-4">
            Demo: usa la contraseña "feca2024"
          </p>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-dark">Panel de Administración</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>

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
            <p className="text-3xl font-bold text-dark">${totalRevenue}</p>
            <p className="text-sm text-gray">Total generado</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-dark mb-4">Inventario de Productos</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray/20">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark">
                    Producto
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark">
                    Categoría
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark">
                    Precio
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray/10">
                    <td className="py-3 px-4 text-sm text-dark">{product.name}</td>
                    <td className="py-3 px-4 text-sm text-gray">{product.category}</td>
                    <td className="py-3 px-4 text-sm text-dark font-semibold">
                      ${product.price}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm font-semibold ${
                          product.stock === 0
                            ? 'text-primary'
                            : product.stock <= 10
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {product.stock} unidades
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Órdenes Recientes</h2>
          {orders.length === 0 ? (
            <p className="text-gray text-center py-8">No hay órdenes registradas</p>
          ) : (
            <div className="space-y-4">
              {orders.slice().reverse().map((order) => (
                <div
                  key={order.id}
                  className="border border-gray/20 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-dark">{order.id}</p>
                      <p className="text-sm text-gray">
                        Referencia: {order.reference}
                      </p>
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
                    <p className="text-sm text-gray">
                      {order.items.length} producto(s)
                    </p>
                    <p className="font-bold text-primary">${order.total}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
