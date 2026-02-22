import { products } from '../data/products';

export const AdminProducts = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-dark mb-4">Inventario de Productos</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray/20">
              <th className="text-left py-3 px-4 text-sm font-semibold text-dark">Producto</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-dark">Categoría</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-dark">Precio</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-dark">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray/10">
                <td className="py-3 px-4 text-sm text-dark">{product.name}</td>
                <td className="py-3 px-4 text-sm text-gray">{product.category}</td>
                <td className="py-3 px-4 text-sm text-dark font-semibold">${product.price.toFixed(2)}</td>
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
  );
};