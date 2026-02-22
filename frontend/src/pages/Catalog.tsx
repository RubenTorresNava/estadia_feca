import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { Filter } from 'lucide-react';

interface CatalogProps {
  onNavigate: (page: string, productId?: string) => void;
}

export const Catalog = ({ onNavigate }: CatalogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === 'Todos'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-light">
      <div className="bg-white border-b border-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Catálogo de Productos</h1>
          <p className="text-gray">
            Explora nuestra colección completa de merchandising oficial
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-dark">Filtrar por categoría</h2>
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-light text-dark hover:bg-gray/10'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-4 text-sm text-gray">
              Mostrando {filteredProducts.length} productos
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
              <div className="text-center py-12">
                <p className="text-gray">No se encontraron productos en esta categoría</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
