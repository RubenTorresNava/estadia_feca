import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import { ProductFormModal } from './ProductFormModal';
import { ConfirmationModal } from './ConfirmationModal'; 
import { Plus, Edit, Trash2 } from 'lucide-react';

export const AdminProducts = () => {
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); 
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null); 

  const handleOpenFormModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (formData: FormData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
    } else {
      await addProduct(formData);
    }
  };

  const handleDeleteRequest = (productId: string) => {
    setDeletingProductId(productId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingProductId) {
      await deleteProduct(deletingProductId);
    }
    setIsConfirmModalOpen(false);
    setDeletingProductId(null);
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p className="text-primary">{error}</p>;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Inventario de Productos</h2>
          <button
            onClick={() => handleOpenFormModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Agregar Producto
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray/20">
                <th className="th-style">Producto</th>
                <th className="th-style">Categoría</th>
                <th className="th-style">Precio</th>
                <th className="th-style">Stock</th>
                <th className="th-style">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray/10">
                  <td className="td-style flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded" />
                    <span className="font-medium text-dark">{product.name}</span>
                  </td>
                  <td className="td-style text-gray">{product.category}</td>
                  <td className="td-style text-dark font-semibold">${product.price.toFixed(2)}</td>
                  <td className="td-style">
                    <span className={`font-semibold ${product.stock === 0 ? 'text-primary' : product.stock <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {product.stock} unidades
                    </span>
                  </td>
                  <td className="td-style">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenFormModal(product)} className="p-2 hover:bg-light rounded-full"><Edit className="h-4 w-4 text-dark" /></button>
                      <button onClick={() => handleDeleteRequest(product.id)} className="p-2 hover:bg-light rounded-full"><Trash2 className="h-4 w-4 text-primary" /></button>
                    </div>
                  </td>
                </tr>
              ))}
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