import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { Filter, Loader2 } from 'lucide-react';

interface CatalogProps {
  onNavigate: (page: string, productId?: string) => void;
}

export const Catalog = ({ onNavigate }: CatalogProps) => {
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.categoria)))];

  const filteredProducts =
    selectedCategory === 'Todos'
      ? products
      : products.filter((p) => p.categoria === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-dark font-medium">Cargando catálogo oficial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="bg-white border-b border-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Catálogo de Productos</h1>
          <p className="text-gray">
            Explora nuestra colección completa de merchandising oficial de la FECA
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-dark">Categorías</h2>
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2 rounded transition-all text-sm font-medium ${
                      selectedCategory === category
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-gray-50 text-dark hover:bg-primary/10'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center text-sm text-gray">
              <span>
                Mostrando <strong>{filteredProducts.length}</strong> productos
              </span>
              {selectedCategory !== 'Todos' && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                  Filtro: {selectedCategory}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={(id) => onNavigate('product', id)}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray text-lg">No hay productos disponibles en esta categoría.</p>
                <button 
                  onClick={() => setSelectedCategory('Todos')}
                  className="mt-4 text-primary font-bold hover:underline"
                >
                  Ver todo el catálogo
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};