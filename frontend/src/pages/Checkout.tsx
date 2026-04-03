import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Loader2 } from "lucide-react";

interface CheckoutProps {
  onNavigate: (page: string) => void;
  onOrderCreated: (orderId: string) => void;
}

export const Checkout = ({ onNavigate, onOrderCreated }: CheckoutProps) => {
  const { cart, getCartTotal, createOrder } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = getCartTotal();

  useEffect(() => {
    if (cart.length === 0) {
      onNavigate("catalog");
    }
  }, [cart.length, onNavigate]);

  if (cart.length === 0) return null;

  const handleCreateOrder = () => {
    if (!customerName || !customerEmail || !matricula) {
      setError(
        "Por favor, completa todos los campos (Nombre, Matrícula y Correo).",
      );
      return;
    }
    setError("");
    setLoading(true);

    try {
      const orderData = {
        nombre_alumno: customerName,
        matricula: matricula,
        correo: customerEmail,
        carrito: cart.map((item) => ({
          id: item.product.id,
          cantidad: item.cantidad,
        })),
      };

      const ordenGenerada = createOrder(
        orderData as unknown as Parameters<typeof createOrder>[0],
      ) as unknown;

      if (typeof ordenGenerada === "string" && ordenGenerada.length > 0) {
        onOrderCreated(ordenGenerada);
      }
    } catch (err) {
      setError("Hubo un problema al procesar tu pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-dark mb-8">Finalizar Pedido</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-dark mb-4">
            1. Información del Estudiante
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
                placeholder="Ej. Juan Pérez López"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray mb-1">
                  Matrícula
                </label>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
                  placeholder="Tu matrícula UJED"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray mb-1">
                  Correo Institucional
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
                  placeholder="alumno@ujed.mx"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-dark mb-4">Resumen de Pago</h2>
          <div className="flex justify-between items-center text-lg mb-4">
            <span className="text-gray">Total a pagar:</span>
            <span className="text-3xl font-extrabold text-primary">
              ${total.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 italic">
            * Al generar la referencia, aceptas acudir a ventanilla para
            realizar el pago correspondiente.
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-center mb-4 font-medium">{error}</p>
        )}

        <button
          onClick={handleCreateOrder}
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-lg font-bold hover:bg-primary-dark transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Procesando...
            </>
          ) : (
            "Generar Referencia de Pago"
          )}
        </button>
      </div>
    </div>
  );
};
