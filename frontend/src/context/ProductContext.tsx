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
    // Cambiado a la ruta correcta del backend para obtener productos (según backend: /api/producto)
    const response = await api.get('/producto');
    const rawData = response.data.productos || response.data;

    const data = Array.isArray(rawData) ? rawData : [rawData];

    const validatedProducts = data.map((p: any) => ({
      ...p,
      precio: parseFloat(p.precio) || 0,
      stock_actual: Number(p.stock_actual) ?? null, // Asegura el mapeo correcto
      imagen_url: p.imagen_url 
        ? `${URL_BASE}${p.imagen_url.startsWith('/') ? '' : '/'}${p.imagen_url}`
        : 'https://via.placeholder.com/150',
      id: p.id.toString(),
      destacado: p.destacado ?? false,
      activo: p.activo ?? true
    }));

    setProducts(validatedProducts);
    setError(null);
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
    await api.post('/administrador/agregar', productData);
    await fetchProducts(); // Refresca el inventario tras agregar
  } catch (e) {
    console.error("Error al agregar producto:", e);
    throw e;
  }
};

  // 3. Actualizar producto

const updateProduct = async (productId: string, productData: FormData) => {
  try {
    await api.patch(`/administrador/modificar/${productId}`, productData);
    await fetchProducts(); // Refresca el inventario tras editar
  } catch (e) {
    console.error("Error al editar producto:", e);
    throw e;
  }
};

  // 4. Eliminar producto

  const deleteProduct = async (productId: string) => {
    try {
      await api.delete(`/administrador/eliminar/${productId}`);
      await fetchProducts(); // Refresca el inventario tras eliminar
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