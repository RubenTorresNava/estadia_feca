import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, productId?: string) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <div className="min-h-screen bg-light">
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Viste con orgullo FECA
              </h1>
              <p className="text-lg mb-8 opacity-90">
                Encuentra productos oficiales de la Facultad de Economía,
                Contaduría y Administración. Calidad y estilo universitario.
              </p>
              <button
                onClick={() => onNavigate('catalog')}
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-light transition-colors inline-flex items-center gap-2"
              >
                Ver Catálogo
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <div className="hidden md:flex justify-center">
              <img
                src="/logoUjed.png"
                alt="UJED"
                className="max-h-64 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-dark">Productos Destacados</h2>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-primary hover:text-primary-dark font-medium inline-flex items-center gap-1 transition-colors"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={(id) => onNavigate('product', id)}
            />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-semibold text-dark mb-2">Recolección en FECA</h3>
              <p className="text-sm text-gray">
                Recoge tu pedido directamente en las instalaciones
              </p>
            </div>
            <div>
              <div className="bg-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="font-semibold text-dark mb-2">Productos Oficiales</h3>
              <p className="text-sm text-gray">
                Calidad garantizada con diseños institucionales
              </p>
            </div>
            <div>
              <div className="bg-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="font-semibold text-dark mb-2">Pago Fácil</h3>
              <p className="text-sm text-gray">
                Genera tu referencia y paga en 24 horas
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
