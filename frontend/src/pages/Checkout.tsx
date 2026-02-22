import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Order } from "../types";

interface CheckoutProps {
  onNavigate: (page: string) => void;
  onOrderCreated: (orderId: string) => void;
}

export const Checkout = ({ onNavigate, onOrderCreated }: CheckoutProps) => {
  const { cart, getCartTotal, createOrder } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "credit_card" | "debit_card"
  >("credit_card");
  const [error, setError] = useState("");

  const total = getCartTotal();

  const generateReference = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `FECA${timestamp}${random}`.slice(0, 20);
  };

  const handleCreateOrder = () => {
    if (!customerName || !customerEmail) {
      setError("Por favor, completa tu nombre y correo electrónico.");
      return;
    }
    setError("");

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
      customerName,
      customerEmail,
      paymentMethod,
    };

    createOrder(order);
    onOrderCreated(order.id);
  };

  if (cart.length === 0) {
    onNavigate("catalog");
    return null;
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-dark mb-8">Finalizar Compra</h1>

        {/* Formulario de Datos Personales */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-dark mb-4">
            1. Datos Personales
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray mb-1"
              >
                Nombre Completo
              </label>
              <input
                type="text"
                id="fullName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Tu Nombre Completo"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray mb-1"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="tu.correo@ejemplo.com"
              />
            </div>
          </div>
        </div>

        {/* Método de Pago */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-dark mb-4">
            2. Método de Pago
          </h2>
          <div className="space-y-3">
            <div
              onClick={() => setPaymentMethod("credit_card")}
              className={`border rounded-md p-4 cursor-pointer transition-all ${paymentMethod === "credit_card" ? "border-primary ring-2 ring-primary" : "border-gray-200"}`}
            >
              <p className="font-semibold text-dark">Tarjeta de Crédito</p>
              <p className="text-sm text-gray">
                Paga en mensualidades (si aplica).
              </p>
            </div>
            <div
              onClick={() => setPaymentMethod("debit_card")}
              className={`border rounded-md p-4 cursor-pointer transition-all ${paymentMethod === "debit_card" ? "border-primary ring-2 ring-primary" : "border-gray-200"}`}
            >
              <p className="font-semibold text-dark">Tarjeta de Débito</p>
              <p className="text-sm text-gray">
                Pago único directo desde tu cuenta.
              </p>
            </div>
          </div>
        </div>

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
                Una vez confirmado el pago, tu pedido tardará aproximadamente 24
                horas en estar listo para recolección.
              </span>
            </li>
          </ul>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

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
