import { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import { ProductFormModal } from './ProductFormModal';
import { ConfirmationModal } from './ConfirmationModal'; 
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { SearchBar } from './SearchBar';


export const AdminProducts = () => {
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); 
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null); 
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('nombre');

  // Filtrado de productos por búsqueda y campo
  const filteredProducts = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return products.filter((p) => {
      if (!lower) return true;
      if (filter === 'nombre') return p.nombre?.toLowerCase().includes(lower);
      if (filter === 'categoria') return p.categoria?.toLowerCase().includes(lower);
      if (filter === 'descripcion') return p.descripcion?.toLowerCase().includes(lower);
      if (filter === 'stock') return p.stock_actual?.toString().includes(lower);
      if (filter === 'precio') return p.precio?.toString().includes(lower);
      return false;
    });
  }, [products, search, filter]);

  const handleOpenFormModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsFormModalOpen(true);
  };

// Dentro de AdminProducts.tsx
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
      // 3. SOLO si la petición fue exitosa, cerramos el modal
      handleCloseFormModal();
    } catch (err) {
      // Si hay un error 400 o 500, el modal se queda abierto para que el usuario corrija
      console.error("Error al procesar el producto en el componente:", err);
    }
  };

  const handleDeleteRequest = (productId: string) => {
    setDeletingProductId(productId);
    setIsConfirmModalOpen(true);
  };

 const handleConfirmDelete = async () => {
  if (deletingProductId) {
    try {
      // Llamamos a la función del contexto
      await deleteProduct(deletingProductId);
      
      // Cerramos el modal de confirmación
      setIsConfirmModalOpen(false);
      setDeletingProductId(null);
    } catch (error) {
      alert("No se pudo eliminar el producto");
    }
  }
};

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p className="text-primary">{error}</p>;

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
                { value: 'stock', label: 'Stock' },
              ]}
              defaultFilter="nombre"
            />
            <button
              onClick={() => handleOpenFormModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-semibold sm:ml-2"
              title="Agregar nuevo producto"
            >
              <Plus className="h-4 w-4" />
              Agregar Producto
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray/20">
                <th className="th-style">Producto</th>
                <th className="th-style">Categoría</th>
                <th className="th-style">Descripcion</th>
                <th className="th-style">Precio</th>
                <th className="th-style">Stock</th>
                <th className="th-style">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray">No hay productos que coincidan con la búsqueda.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray/10">
                    <td className="td-style flex items-center gap-3">
                      <img src={product.imagen_url} alt={product.nombre} className="h-10 w-10 object-cover rounded" />
                      <span className="font-medium text-dark">{product.nombre}</span>
                    </td>
                    <td className="td-style text-gray">{product.categoria}</td>
                    <td className="td-style text-gray">{product.descripcion}</td>
                    <td className="td-style text-dark font-semibold">${product.precio.toFixed(2)}</td>
                    <td className="td-style">
                      <span className={`font-semibold ${product.stock_actual === 0 ? 'text-primary' : product.stock_actual <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {product.stock_actual} unidades
                      </span>
                    </td>
                    <td className="td-style">
                      <div className="flex gap-2">
                        <button
                          className="p-2 hover:bg-yellow-100 rounded-full group"
                          title="Destacar producto"
                        >
                          <Star className="h-4 w-4 text-yellow-400 group-hover:scale-110 transition-transform" fill="none" />
                        </button>
                        <button
                          onClick={() => handleOpenFormModal(product)}
                          className="p-2 hover:bg-light rounded-full"
                          title="Editar producto"
                        >
                          <Edit className="h-4 w-4 text-dark" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(product.id)}
                          className="p-2 hover:bg-light rounded-full"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4 text-primary" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
        message="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
      />
      <style>{`
        .th-style { text-align: left; padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 600; color: #4A4A4D; }
        .td-style { padding: 0.75rem 1rem; font-size: 0.875rem; }
      `}</style>
    </>
  );
};