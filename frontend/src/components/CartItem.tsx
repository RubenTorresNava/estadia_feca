import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, cantidad: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const { product, cantidad } = item;
  
  const total = Number(product.precio) * cantidad;

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray/10">
      <img
        src={product.imagen_url || '/placeholder-product.png'}
        alt={product.nombre}
        className="w-24 h-24 object-cover rounded shadow-sm"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-dark mb-1 line-clamp-1">{product.nombre}</h3>
        <p className="text-xs text-gray uppercase mb-2 tracking-wide">{product.categoria}</p>
        <p className="text-primary font-bold">${Number(product.precio).toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove(product.id)}
          className="text-gray-400 hover:text-red-600 transition-colors p-1"
          title="Eliminar del carrito"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-2 bg-light/50 rounded-lg p-1 border border-gray/10">
          <button
            onClick={() => onUpdateQuantity(product.id, cantidad - 1)}
            className="p-1 rounded bg-white border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-30"
            disabled={cantidad <= 1}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center font-bold text-sm text-dark">{cantidad}</span>
          <button
            onClick={() => onUpdateQuantity(product.id, cantidad + 1)}
            className="p-1 rounded bg-white border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-30"
            disabled={cantidad >= product.stock_actual}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        
        <p className="font-extrabold text-dark text-sm">
          ${total.toFixed(2)}
        </p>
      </div>
    </div>
  );
};