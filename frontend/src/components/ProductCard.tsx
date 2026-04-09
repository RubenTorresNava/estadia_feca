import { Product } from '../types';
import { formatCurrency } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  onViewDetails: (productId: string) => void;
}

export const ProductCard = ({ product, onViewDetails }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer transition-transform hover:scale-105 h-full flex flex-col">
      <div
        onClick={() => onViewDetails(product.id)}
        className="aspect-square overflow-hidden bg-light cursor-pointer"
        title={`Ver detalles de ${product.nombre}`}
      >
        <img
          /* CORRECCIÓN: Usamos imagen_url */
          src={product.imagen_url || '/placeholder-product.png'}
          alt={product.nombre}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* CORRECCIÓN: categoria y nombre */}
          <p className="text-xs text-gray uppercase mb-1">{product.categoria}</p>
          <h3 className="font-semibold text-dark mb-2 line-clamp-2" title={product.nombre}>
            {product.nombre}
          </h3>
        </div>
        
        <div>
          <div className="flex items-center justify-between">
            {/* CORRECCIÓN: precio */}
            <p className="text-xl font-bold text-primary">
              {formatCurrency(product.precio)}
            </p>
            <button
              onClick={() => onViewDetails(product.id)}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              title="Ver detalles del producto"
            >
              Ver detalles
            </button>
          </div>

          {/* CORRECCIÓN: stock_actual */}
          {product.stock_actual <= 10 && product.stock_actual > 0 && (
            <p className="text-xs text-orange-600 font-medium mt-2">
              ¡Solo quedan {product.stock_actual} disponibles!
            </p>
          )}
          {product.stock_actual === 0 && (
            <p className="text-xs text-primary font-bold mt-2">
              Agotado temporalmente
            </p>
          )}
        </div>
      </div>
    </div>
  );
};