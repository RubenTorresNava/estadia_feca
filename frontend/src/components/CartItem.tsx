import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const { product, quantity } = item;
  const total = product.price * quantity;

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm">
      <img
        src={product.image}
        alt={product.name}
        className="w-24 h-24 object-cover rounded"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-dark mb-1">{product.name}</h3>
        <p className="text-sm text-gray mb-2">{product.category}</p>
        <p className="text-primary font-bold">${product.price}</p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove(product.id)}
          className="text-gray hover:text-primary transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
            className="p-1 rounded border border-gray hover:bg-light transition-colors"
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <button
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            className="p-1 rounded border border-gray hover:bg-light transition-colors"
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="font-bold text-dark">${total}</p>
      </div>
    </div>
  );
};
