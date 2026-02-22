import { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, UploadCloud } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  product?: Product | null;
}

export const ProductFormModal = ({ isOpen, onClose, onSubmit, product }: ProductFormModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(String(product.price));
      setStock(String(product.stock));
      setCategory(product.category);
      setImagePreview(product.image);
      setImage(null);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategory('');
      setImage(null);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar el producto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-dark">
            {product ? 'Editar Producto' : 'Agregar Producto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-light rounded-full">
            <X className="h-5 w-5 text-gray" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full input-style" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full input-style" rows={4}></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Precio</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full input-style" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Stock</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="w-full input-style" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Categoría</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full input-style" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Imagen</label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray/40 px-6 py-10">
              <div className="text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Vista previa" className="mx-auto h-32 w-32 object-cover rounded-md mb-4" />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-gray" />
                )}
                <div className="mt-4 flex text-sm leading-6 text-gray">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-dark">
                    <span>Sube un archivo</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                  </label>
                  <p className="pl-1">o arrastra y suelta</p>
                </div>
                <p className="text-xs leading-5 text-gray">PNG, JPG, GIF hasta 10MB</p>
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-light text-dark font-semibold hover:bg-gray/20">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark disabled:bg-gray">
              {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
      <style>{`.input-style { border: 1px solid #8E8E9040; border-radius: 0.5rem; padding: 0.5rem 1rem; width: 100%; }`}</style>
    </div>
  );
};