import { CartItem } from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

interface CartProps {
  onNavigate: (page: string) => void;
}

export const Cart = ({ onNavigate }: CartProps) => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2">Tu carrito está vacío</h2>
          <p className="text-gray mb-6">Agrega productos para comenzar tu compra</p>
          <button
            onClick={() => onNavigate('catalog')}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Explorar Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('catalog')}
          className="inline-flex items-center gap-2 text-gray hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Seguir comprando
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-3xl font-bold text-dark mb-6">Carrito de Compras</h1>
            {cart.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-dark mb-4">Resumen de Compra</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray">
                  <span>Subtotal</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between text-gray">
                  <span>Envío</span>
                  <span>Recolección en FECA</span>
                </div>
                <div className="border-t border-gray/20 pt-3">
                  <div className="flex justify-between text-dark font-bold text-xl">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('checkout')}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Proceder al Pago
              </button>

              <div className="mt-6 p-4 bg-light rounded-lg">
                <p className="text-sm text-gray">
                  Una vez generada tu referencia de pago, tendrás 24 horas para realizar
                  el pago. Los productos quedarán apartados durante este tiempo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
