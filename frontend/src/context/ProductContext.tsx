import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
// Importa tu instancia de axios configurada
import api from '../api/api.ts'; 
import { useAuth } from './AuthContext.tsx';


interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (productData: FormData) => Promise<void>;
  updateProduct: (productId: string, productData: FormData) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const URL_BASE = 'http://localhost:3000';

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAdmin } = useAuth(); // Esto detectará cuando el login cambie isAdmin a true

const fetchProducts = async () => {
  setLoading(true);
  try {
    const response = await api.get('/administrador/obtenerProductos');
    
    const data = response.data;

    const validatedProducts = data.map((p: any) => ({
      ...p,
      precio: parseFloat(p.precio) || 0, 
      imagen_url: p.imagen_url 
    ? `${URL_BASE}${p.imagen_url.startsWith('/') ? '' : '/'}${p.imagen_url}`
    : 'https://via.placeholder.com/150',
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
    if (isAdmin) {
      fetchProducts();
    }
    }, [isAdmin]);

  // 2. Agregar producto (Usando FormData para imágenes)
const addProduct = async (productData: FormData) => {
  try {
    const response = await api.post('/administrador/agregarProducto', productData);
    
    const nuevoProdBackend = response.data.producto;

    const URL_BASE = "http://localhost:3000";
    const productoParaEstado: Product = {
      ...nuevoProdBackend,
      id: nuevoProdBackend.id.toString(),
      precio: parseFloat(nuevoProdBackend.precio),
      imagen_url: `${URL_BASE}${nuevoProdBackend.imagen_url}`
    };

    setProducts((prev) => [...prev, productoParaEstado]);

  } catch (e) {
    console.error("Error al agregar producto:", e);
    throw e;
  }
};

  // 3. Actualizar producto
const updateProduct = async (productId: string, productData: FormData) => {
  try {
    const response = await api.put(`/administrador/editarProducto/${productId}`, productData);
    
    const updatedProdBackend = response.data.producto;
    const URL_BASE = "http://localhost:3000";

    const productoValidado: Product = {
      ...updatedProdBackend,
      id: updatedProdBackend.id.toString(),
      precio: parseFloat(updatedProdBackend.precio),
      imagen_url: updatedProdBackend.imagen_url.startsWith('http') 
                  ? updatedProdBackend.imagen_url 
                  : `${URL_BASE}${updatedProdBackend.imagen_url}`
    };

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? productoValidado : p))
    );

  } catch (e) {
    console.error("Error al editar producto:", e);
    throw e;
  }
};

  // 4. Eliminar producto
  const deleteProduct = async (productId: string) => {
    try {
      // Si tu backend hace soft delete, usa PATCH o PUT según tu API
      await api.delete(`/administrador/eliminarProducto/${productId}`);
      
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