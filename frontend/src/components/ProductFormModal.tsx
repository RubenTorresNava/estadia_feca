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
  // Sincronizamos los estados con tu interfaz en español
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock_actual, setStockActual] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Al cargar un producto para editar, usamos los nombres nuevos
  useEffect(() => {
    if (product) {
      setNombre(product.nombre);
      setDescripcion(product.descripcion);
      setPrecio(String(product.precio));
      setStockActual(String(product.stock_actual));
      setCategoria(product.categoria);
      setImagePreview(product.imagen_url); // Mostramos la imagen que ya tiene
      setImagen(null);
    } else {
      setNombre('');
      setPrecio('');
      setStockActual('');
      setCategoria('');
      setImagen(null);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // IMPORTANTE: Los nombres en append deben coincidir con lo que espera tu Backend (Multer/Controller)
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', precio);
    formData.append('stock_actual', stock_actual);
    formData.append('categoria', categoria);
    
    if (imagen) {
      // El nombre 'imagen' debe ser el mismo que uses en el backend: upload.single('imagen')
      formData.append('imagen', imagen);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    
    // 1. Guardamos el archivo real para el FormData
    setImagen(file);

    // 2. Creamos una URL temporal para que el usuario vea la foto antes de subirla
    // Si ya había una previa de un archivo anterior, la liberamos
    if (imagePreview && !imagePreview.startsWith('http')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
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
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          required 
          className="w-full input-style" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark mb-1">Descripción</label>
        <textarea 
          value={descripcion} 
          onChange={(e) => setDescripcion(e.target.value)} 
          required 
          className="w-full input-style" 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Precio</label>
          <input 
            type="number" 
            step="0.01" // Permite decimales
            value={precio} 
            onChange={(e) => setPrecio(e.target.value)} 
            required 
            className="w-full input-style" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Stock</label>
          <input 
            type="number" 
            value={stock_actual} 
            onChange={(e) => setStockActual(e.target.value)} 
            required 
            className="w-full input-style" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
            className="w-full input-style"
          >
            <option value="" disabled>Selecciona una categoría</option>
            <option value="Ropa">Ropa</option>
            <option value="Accesorios">Accesorios</option>
            <option value="Papelería">Papelería</option>
            <option value="Electrónica">Electrónica</option>
            <option value="Botellas y termos">Botellas y termos</option>
            <option value="Bolsas y mochilas">Bolsas y mochilas</option>
            <option value="Stickers y pines">Stickers y pines</option>
            <option value="Otros">Otros</option>
          </select>
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