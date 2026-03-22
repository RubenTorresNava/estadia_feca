import { useState, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { SearchBar } from '../components/SearchBar';
interface HomeProps {
  onNavigate: (page: string, productId?: string) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {

  // Extraemos productos y estado de carga del contexto
  const { products, loading } = useProducts();


  // Estado para búsqueda y filtro
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('nombre');

  // Filtrado y búsqueda combinados por campo
  const filteredProducts = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return products
      .filter((p) => p.destacado || p.stock_actual > 0)
      .filter((p) => {
        if (!lower) return true;
        if (filter === 'nombre') return p.nombre?.toLowerCase().includes(lower);
        if (filter === 'categoria') return p.categoria?.toLowerCase().includes(lower);
        if (filter === 'descripcion') return p.descripcion?.toLowerCase().includes(lower);
        return false;
      })
      .slice(0, 4);
  }, [products, search, filter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold text-dark">Novedades FECA</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <SearchBar
              placeholder="Buscar..."
              onSearch={(q, f) => { setSearch(q); setFilter(f); }}
              className="sm:w-72 w-full"
              options={[
                { value: 'nombre', label: 'Producto' },
                { value: 'categoria', label: 'Categoría' },
                { value: 'descripcion', label: 'Descripción' },
              ]}
              defaultFilter="nombre"
            />
            <button
              onClick={() => onNavigate('catalog')}
              className="text-primary hover:text-primary-dark font-medium inline-flex items-center gap-1 transition-colors sm:ml-2"
              title="Ver catálogo completo"
            >
              Ver catálogo completo
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray py-10">No hay productos que coincidan con la búsqueda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={(id) => onNavigate('product', id)}
              />
            ))}
          </div>
        )}
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
