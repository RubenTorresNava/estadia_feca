import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Order } from "../types";
import { CheckCircle, Copy, Home } from "lucide-react";

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

export const Checkout = ({ onNavigate }: CheckoutProps) => {
  const { cart, getCartTotal, createOrder } = useCart();
  const [orderCreated, setOrderCreated] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

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
      status: "pending",
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };

    createOrder(order);
    setCurrentOrder(order);
    setOrderCreated(true);
  };

  const handleCopyReference = () => {
    if (currentOrder) {
      navigator.clipboard.writeText(currentOrder.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (cart.length === 0 && !orderCreated) {
    onNavigate("catalog");
    return null;
  }

  if (orderCreated && currentOrder) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center py-12">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-dark mb-4">
              Orden Creada Exitosamente
            </h1>
            <p className="text-gray mb-8">
              Tu pedido ha sido registrado. Realiza el pago en las próximas 24
              horas.
            </p>

            <div className="bg-light rounded-lg p-6 mb-6">
              <p className="text-sm text-gray mb-2">Referencia de pago:</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-2xl font-bold text-primary font-mono">
                  {currentOrder.reference}
                </p>
                <button
                  onClick={handleCopyReference}
                  className="p-2 hover:bg-white rounded transition-colors"
                  title="Copiar referencia"
                >
                  <Copy
                    className={`h-5 w-5 ${copied ? "text-green-600" : "text-gray"}`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-dark mb-3">
                Instrucciones de pago:
              </h3>
              <ol className="space-y-2 text-sm text-gray">
                <li>1. Acude a cualquier banco o tienda de conveniencia</li>
                <li>2. Menciona que deseas realizar un pago con referencia</li>
                <li>
                  3. Proporciona la referencia:{" "}
                  <span className="font-mono font-semibold">
                    {currentOrder.reference}
                  </span>
                </li>
                <li>
                  4. Realiza el pago por:{" "}
                  <span className="font-bold text-primary">
                    ${currentOrder.total}
                  </span>
                </li>
                <li>
                  5. El pedido será autorizado en 1-2 horas después del pago
                </li>
              </ol>
            </div>

            <div className="border-t border-gray/20 pt-6 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray">Total a pagar:</span>
                <span className="font-bold text-dark text-xl">
                  ${currentOrder.total}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray">Expira en:</span>
                <span className="text-primary font-semibold">24 horas</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate("home")}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
            >
              <Home className="h-5 w-5" />
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
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
