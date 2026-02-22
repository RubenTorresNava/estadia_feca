import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (productId: string) => void;
}

export const ProductCard = ({ product, onViewDetails }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer transition-transform hover:scale-105">
      <div
        onClick={() => onViewDetails(product.id)}
        className="aspect-square overflow-hidden bg-light"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-gray uppercase mb-1">{product.category}</p>
        <h3 className="font-semibold text-dark mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-primary">${product.price}</p>
          <button
            onClick={() => onViewDetails(product.id)}
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Ver detalles
          </button>
        </div>
        {product.stock <= 10 && product.stock > 0 && (
          <p className="text-xs text-gray mt-2">
            Solo quedan {product.stock} disponibles
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-primary mt-2">Agotado</p>
        )}
      </div>
    </div>
  );
};
