import { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

interface ProductDetailProps {
  productId: string;
  onNavigate: (page: string) => void;
}

export const ProductDetail = ({ productId, onNavigate }: ProductDetailProps) => {
  const product = products.find((p) => p.id === productId);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray mb-4">Producto no encontrado</p>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-primary hover:text-primary-dark font-medium"
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
          className="inline-flex items-center gap-2 text-gray hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[500px] object-cover"
            />
          </div>

          <div>
            <p className="text-sm text-gray uppercase mb-2">{product.category}</p>
            <h1 className="text-4xl font-bold text-dark mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-6">${product.price}</p>

            <div className="bg-white rounded-lg p-6 mb-6">
              <h2 className="font-semibold text-dark mb-2">Descripción</h2>
              <p className="text-gray leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-dark font-medium">Disponibilidad:</span>
                {product.stock > 0 ? (
                  <span className="text-green-600 font-semibold">
                    {product.stock} en stock
                  </span>
                ) : (
                  <span className="text-primary font-semibold">Agotado</span>
                )}
              </div>

              {product.stock > 0 && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-dark font-medium">Cantidad:</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 rounded border border-gray hover:bg-light transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-semibold text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-2 rounded border border-gray hover:bg-light transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2 ${
                      added
                        ? 'bg-green-600 text-white'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {added ? 'Agregado al carrito' : 'Agregar al carrito'}
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
