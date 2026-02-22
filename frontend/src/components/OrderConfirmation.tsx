import { useState } from 'react';
import { Order } from '../types';
import { CheckCircle, Copy, Home } from 'lucide-react';

interface OrderConfirmationProps {
  order: Order;
  onNavigate: (page: string) => void;
}

export const OrderConfirmation = ({ order, onNavigate }: OrderConfirmationProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReference = () => {
    navigator.clipboard.writeText(order.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            horas para asegurar tus productos.
          </p>

          <div className="bg-light rounded-lg p-6 mb-6">
            <p className="text-sm text-gray mb-2">Referencia de pago:</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-2xl font-bold text-primary font-mono">
                {order.reference}
              </p>
              <button
                onClick={handleCopyReference}
                className="p-2 hover:bg-white rounded transition-colors"
                title="Copiar referencia"
              >
                <Copy
                  className={`h-5 w-5 ${copied ? 'text-green-600' : 'text-gray'}`}
                />
              </button>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-dark mb-3">
              Instrucciones de pago:
            </h3>
            <ol className="space-y-2 text-sm text-gray">
              <li>1. Acude a cualquier banco o tienda de conveniencia.</li>
              <li>2. Menciona que deseas realizar un pago con referencia.</li>
              <li>
                3. Proporciona la referencia:{' '}
                <span className="font-mono font-semibold">
                  {order.reference}
                </span>
              </li>
              <li>
                4. Realiza el pago por:{' '}
                <span className="font-bold text-primary">${order.total}</span>
              </li>
              <li>
                5. El pedido será autorizado en 1-2 horas después del pago.
              </li>
            </ol>
          </div>

          <div className="border-t border-gray/20 pt-6 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray">Total a pagar:</span>
              <span className="font-bold text-dark text-xl">${order.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray">Expira en:</span>
              <span className="text-primary font-semibold">24 horas</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
          >
            <Home className="h-5 w-5" />
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};