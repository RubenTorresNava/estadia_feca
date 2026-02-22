import { useCart } from '../context/CartContext';
import { Order } from '../types';

interface CheckoutProps {
  onNavigate: (page: string) => void;
  onOrderCreated: (orderId: string) => void;
}

export const Checkout = ({ onNavigate, onOrderCreated }: CheckoutProps) => {
  const { cart, getCartTotal, createOrder } = useCart();

  const total = getCartTotal();

  const generateReference = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `FECA${timestamp}${random}`.slice(0, 20);
  };

  const handleCreateOrder = () => {
    const reference = generateReference();
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const order: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      total,
      reference,
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };

    createOrder(order);
    onOrderCreated(order.id);
  };

  if (cart.length === 0) {
    onNavigate('catalog');
    return null;
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-dark mb-8">Finalizar Compra</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-dark mb-4">
            Información Importante
          </h2>
          <ul className="space-y-3 text-sm text-gray">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                Se generará una referencia de pago única para tu orden.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                Tendrás 24 horas para realizar el pago. Si no se completa, el
                pedido se cancelará automáticamente.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                Los productos quedarán apartados durante este período.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                Una vez confirmado el pago, tu pedido tardará aproximadamente 24
                horas en estar listo para recolección.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                Podrás recoger tu pedido en las instalaciones de FECA.
              </span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleCreateOrder}
          className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors text-lg"
        >
          Generar Referencia de Pago
        </button>
      </div>
    </div>
  );
};