import { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

interface ProductDetailProps {
  productId: string;
  onNavigate: (page: string) => void;
}

export const ProductDetail = ({ productId, onNavigate }: ProductDetailProps) => {
  const { products } = useProducts();
  
  const product = products.find((p) => p.id === productId);
  
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray mb-4 font-semibold text-lg">Cargando detalles del producto...</p>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-primary hover:text-primary-dark font-medium underline"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('catalog')}
          className="inline-flex items-center gap-2 text-gray hover:text-primary transition-colors mb-8 font-medium"
          title="Volver al catálogo"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray/10">
            <img
              src={product.imagen_url || '/placeholder-product.png'}
              alt={product.nombre}
              className="w-full h-[500px] object-cover"
            />
          </div>

          <div>
            <p className="text-sm text-gray uppercase tracking-widest mb-2">{product.categoria}</p>
            <h1 className="text-4xl font-bold text-dark mb-4">{product.nombre}</h1>
            <p className="text-3xl font-bold text-primary mb-6">${Number(product.precio).toFixed(2)}</p>

            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h2 className="font-semibold text-dark mb-2">Descripción</h2>
              <p className="text-gray leading-relaxed">
                {product.descripcion || 'Sin descripción disponible por el momento.'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-dark font-medium">Disponibilidad:</span>
                {product.stock_actual > 0 ? (
                  <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                    {product.stock_actual} unidades disponibles
                  </span>
                ) : (
                  <span className="text-primary font-bold bg-red-50 px-2 py-1 rounded">Agotado</span>
                )}
              </div>

              {product.stock_actual > 0 && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-dark font-medium">Cantidad:</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 rounded border border-gray-300 hover:bg-light transition-colors"
                        title="Disminuir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock_actual, quantity + 1))}
                        className="p-2 rounded border border-gray-300 hover:bg-light transition-colors"
                        title="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-4 rounded-lg font-bold transition-all transform hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-2 ${
                      added
                        ? 'bg-green-600 text-white shadow-green-200'
                        : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
                    }`}
                    title="Agregar producto al carrito"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {added ? '¡Producto Agregado!' : 'Agregar al carrito'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};