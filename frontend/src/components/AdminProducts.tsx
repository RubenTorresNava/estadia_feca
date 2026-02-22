import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import { ProductFormModal } from './ProductFormModal';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const AdminProducts = () => {
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOpenModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (formData: FormData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
    } else {
      await addProduct(formData);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      await deleteProduct(productId);
    }
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p className="text-primary">{error}</p>;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Inventario de Productos</h2>
          <button
            onClick={() => handleOpenModal()}
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
                      <button onClick={() => handleOpenModal(product)} className="p-2 hover:bg-light rounded-full"><Edit className="h-4 w-4 text-dark" /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-light rounded-full"><Trash2 className="h-4 w-4 text-primary" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        product={editingProduct}
      />
      <style>{`
        .th-style { text-align: left; padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 600; color: #4A4A4D; }
        .td-style { padding: 0.75rem 1rem; font-size: 0.875rem; }
      `}</style>
    </>
  );
};