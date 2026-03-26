import { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import { ProductFormModal } from './ProductFormModal';
import { ConfirmationModal } from './ConfirmationModal'; 
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { SearchBar } from './SearchBar';

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

  // 5. Renderizado de contingencia
  if (loading) return <div className="p-6 text-center">Cargando inventario...</div>;
  if (error) return <div className="p-6 text-red-600 text-center">Error: {error}</div>;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-dark">Inventario de Productos</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <SearchBar
              placeholder="Buscar..."
              onSearch={(q, f) => { setSearch(q); setFilter(f); }}
              className="sm:w-72 w-full"
              options={[
                { value: 'nombre', label: 'Producto' },
                { value: 'categoria', label: 'Categoría' },
                { value: 'descripcion', label: 'Descripción' },
                { value: 'precio', label: 'Precio' },
                { value: 'stock_actual', label: 'Stock' },
              ]}
              defaultFilter="nombre"
            />
            <button
              onClick={() => handleOpenFormModal()}
              className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar Producto
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray/20 text-left">
                <th className="p-3 text-sm font-bold text-gray-600">Producto</th>
                <th className="p-3 text-sm font-bold text-gray-600">Categoría</th>
                <th className="p-3 text-sm font-bold text-gray-600">Descripción</th>
                <th className="p-3 text-sm font-bold text-gray-600">Precio</th>
                <th className="p-3 text-sm font-bold text-gray-600">Stock</th>
                <th className="p-3 text-sm font-bold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray/5 hover:bg-gray-50">
                  <td className="p-3 text-sm flex items-center gap-3">
                    <img 
                      src={product.imagen_url || 'https://via.placeholder.com/50'} 
                      alt={product.nombre} 
                      className="w-12 h-12 object-cover rounded" 
                    />
                    <span className="font-bold text-dark">{product.nombre}</span>
                  </td>
                  <td className="p-3 text-sm">{product.categoria}</td>
                  <td className="p-3 text-sm truncate max-w-xs">{product.descripcion}</td>
                  <td className="p-3 text-sm font-bold text-dark">
                    ${Number(product.precio).toFixed(2)}
                  </td>
                  <td className="p-3 text-sm font-bold">
                    <span className={Number(product.stock_actual) > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.stock_actual !== null && product.stock_actual !== undefined
                        ? (Number(product.stock_actual) > 0 ? `${product.stock_actual} uds` : 'Agotado')
                        : 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenFormModal(product)}
                        className="p-2 rounded hover:bg-blue-50"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(product.id)}
                        className="p-2 rounded hover:bg-red-50"
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
            <div className="text-center py-10 text-gray-500">No se encontraron productos.</div>
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
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
      />
    </>
  );
};