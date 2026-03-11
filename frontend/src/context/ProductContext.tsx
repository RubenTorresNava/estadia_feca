import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
// Importa tu instancia de axios configurada
import api from '../api/api.ts'; 

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (productData: FormData) => Promise<void>;
  updateProduct: (productId: string, productData: FormData) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const fetchProducts = async () => {
  setLoading(true);
  try {
    const response = await api.get('/administrador/obtenerProductos');
    
    const data = response.data;

    const validatedProducts = data.map((p: any) => ({
      ...p,
      precio: parseFloat(p.precio) || 0, 
      imagen_url: p.imagen_url || 'https://via.placeholder.com/150',
      id: p.id.toString() 
    }));

    setProducts(validatedProducts);
  } catch (e) {
    console.error('Error al cargar productos:', e);
    setError('Error al cargar los productos');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Agregar producto (Usando FormData para imágenes)
  const addProduct = async (productData: FormData) => {
    try {
      const response = await api.post('/productos', productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Actualizamos el estado con el producto que devuelve el backend
      setProducts((prev) => [...prev, response.data]);
    } catch (e) {
      console.error('Error al agregar:', e);
      throw e; // Lánzalo para que el componente UI pueda mostrar una alerta
    }
  };

  // 3. Actualizar producto
  const updateProduct = async (productId: string, productData: FormData) => {
    try {
      const response = await api.put(`/productos/${productId}`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? response.data : p))
      );
    } catch (e) {
      console.error('Error al actualizar:', e);
      throw e;
    }
  };

  // 4. Eliminar producto
  const deleteProduct = async (productId: string) => {
    try {
      // Si tu backend hace soft delete, usa PATCH o PUT según tu API
      await api.delete(`/productos/${productId}`);
      
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (e) {
      console.error('Error al eliminar:', e);
      throw e;
    }
  };

  return (
    <ProductContext.Provider
      value={{ products, loading, error, addProduct, updateProduct, deleteProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};