import { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import { ProductFormModal } from './ProductFormModal';
import { ConfirmationModal } from './ConfirmationModal'; 
import { Plus, Edit, Trash2, Star, Boxes, Sparkles, AlertCircle } from 'lucide-react';
import { SearchBar } from './SearchBar';
import api from '../api/api';
import { formatCurrency } from '../utils/currency';
  // Botón destacar producto
  const handleToggleFeatured = async (product: Product) => {
    try {
      const token = localStorage.getItem('feca-admin-token');
      await api.patch(`/administrador/destacado/${product.id}`, {}, {
        headers: {
          'x-token': token || '',
        },
      });
      // Refrescar productos tras destacar
      await new Promise(res => setTimeout(res, 200));
      window.location.reload(); // O usa fetchProducts si lo tienes expuesto
    } catch (err) {
      console.error("Error al destacar producto:", err);
    }
  };

export const AdminProducts = () => {
  // 1. Hooks de Contexto
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();

  // 2. Estados Locales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); 
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null); 
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('nombre');

  // 3. Lógica de Handlers (Ahora dentro del componente)
  
  const handleOpenFormModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await addProduct(formData);
      }
      handleCloseFormModal();
    } catch (err) {
      console.error("Error al procesar producto:", err);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingProductId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingProductId) {
      try {
        await deleteProduct(deletingProductId);
        setDeletingProductId(null);
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
    setIsConfirmModalOpen(false);
  };

  // 4. Lógica de Filtrado
  const filteredProducts = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return products.filter((p) => {
      if (!lower) return true;
      const val = p[filter as keyof Product]; // Acceso dinámico seguro
      return val?.toString().toLowerCase().includes(lower);
    });
  }, [products, search, filter]);

  const stats = useMemo(() => {
    const total = products.length;
    const destacados = products.filter((p) => p.destacado).length;
    const agotados = products.filter((p) => Number(p.stock_actual) <= 0).length;
    const stockBajo = products.filter((p) => Number(p.stock_actual) > 0 && Number(p.stock_actual) <= 10).length;
    return { total, destacados, agotados, stockBajo };
  }, [products]);

  // 5. Renderizado de contingencia
  if (loading) return <div className="p-6 text-center">Cargando inventario...</div>;
  if (error) return <div className="p-6 text-red-600 text-center">Error: {error}</div>;

  return (
    <>
      <section className="mb-5 rounded-2xl border border-black/5 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dark/45">Inventario</p>
            <h2 className="mt-1 text-2xl font-extrabold text-dark inline-flex items-center gap-2">
              <Boxes className="h-6 w-6 text-primary" />
              Inventario de Productos
            </h2>
            <p className="mt-1 text-sm text-dark/65">Gestiona catálogo, stock y destacados desde esta vista.</p>
          </div>

          <button
            onClick={() => handleOpenFormModal()}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Agregar Producto
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-black/10 bg-light/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-dark/55 font-semibold">Total</p>
            <p className="text-2xl font-extrabold text-dark">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-light/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-dark/55 font-semibold">Destacados</p>
            <p className="text-2xl font-extrabold text-dark inline-flex items-center gap-1">
              {stats.destacados}
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </p>
          </div>
          <div className="rounded-xl border border-black/10 bg-light/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-dark/55 font-semibold">Stock bajo</p>
            <p className="text-2xl font-extrabold text-dark inline-flex items-center gap-1">
              {stats.stockBajo}
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </p>
          </div>
          <div className="rounded-xl border border-black/10 bg-light/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-dark/55 font-semibold">Agotados</p>
            <p className="text-2xl font-extrabold text-dark">{stats.agotados}</p>
          </div>
        </div>
      </section>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <h3 className="text-lg font-bold text-dark">Listado de productos</h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <SearchBar
              placeholder="Buscar en inventario..."
              onSearch={(q, f) => { setSearch(q); setFilter(f); }}
              className="sm:w-80 w-full"
              options={[
                { value: 'nombre', label: 'Producto' },
                { value: 'categoria', label: 'Categoría' },
                { value: 'descripcion', label: 'Descripción' },
                { value: 'precio', label: 'Precio' },
                { value: 'stock_actual', label: 'Stock' },
              ]}
              defaultFilter="nombre"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray/15">
          <table className="w-full">
            <thead className="bg-light/70">
              <tr className="border-b border-gray/20 text-left">
                <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Producto</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Categoría</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Descripción</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Precio</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60">Stock</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wide text-dark/60 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray/10 hover:bg-light/35 transition-colors">
                  <td className="p-3 text-sm">
                    <div className="flex items-center gap-3 min-w-[220px]">
                    <img 
                      src={product.imagen_url || 'https://via.placeholder.com/50'} 
                      alt={product.nombre} 
                      className="w-12 h-12 object-cover rounded-lg border border-black/10 bg-white"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/50';
                      }}
                    />
                    <div>
                      <p className="font-bold text-dark leading-tight">{product.nombre}</p>
                    </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    <span className="inline-flex rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-dark/75">
                      {product.categoria}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-dark/75 max-w-xs truncate" title={product.descripcion}>{product.descripcion}</td>
                  <td className="p-3 text-sm font-bold text-dark">
                    {formatCurrency(product.precio)}
                  </td>
                  <td className="p-3 text-sm font-bold">
                    <span className={
                      Number(product.stock_actual) > 10
                        ? 'text-green-600'
                        : Number(product.stock_actual) > 0
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }>
                      {product.stock_actual !== null && product.stock_actual !== undefined
                        ? (Number(product.stock_actual) > 0 ? `${product.stock_actual} uds` : 'Agotado')
                        : 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex justify-center gap-2 min-w-[132px]">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        className={`p-2 rounded-lg border transition-colors ${product.destacado ? 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200' : 'bg-white border-black/10 hover:bg-yellow-50'}`}
                        title={product.destacado ? 'Quitar de destacados' : 'Destacar producto'}
                      >
                        <Star className={`h-4 w-4 ${product.destacado ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      </button>
                      <button
                        onClick={() => handleOpenFormModal(product)}
                        className="p-2 rounded-lg border border-black/10 bg-white hover:bg-blue-50"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(product.id)}
                        className="p-2 rounded-lg border border-black/10 bg-white hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-14 text-dark/60 bg-white">No se encontraron productos con el criterio actual.</div>
          )}
        </div>
      </div>

      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleSubmit}
        product={editingProduct}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
      />
    </>
  );
};