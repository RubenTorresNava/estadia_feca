import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';

// Simulación de API - Reemplazar con llamadas reales
const FAKE_API_URL = 'http://localhost:3000/api/administrador';

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
      // En una app real, aquí se obtendrían los productos del backend
      // Por ahora, usamos los datos estáticos y los enriquecemos
      const { products: staticProducts } = await import('../data/products');
      setProducts(staticProducts);
    } catch (e) {
      setError('Error al cargar los productos');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (productData: FormData) => {
    // Simulación de llamada a la API
    console.log('Agregando producto:', Object.fromEntries(productData.entries()));
    // Aquí iría la llamada real:
    // const response = await fetch(FAKE_API_URL, { method: 'POST', body: productData });
    // const newProduct = await response.json();
    // setProducts(prev => [...prev, newProduct]);

    // Simulación local
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: productData.get('name') as string,
      description: productData.get('description') as string,
      price: Number(productData.get('price')),
      category: productData.get('category') as string,
      stock: Number(productData.get('stock')),
      image: URL.createObjectURL(productData.get('image') as File),
      featured: false,
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = async (productId: string, productData: FormData) => {
    console.log(`Actualizando producto ${productId}:`, Object.fromEntries(productData.entries()));
    // Aquí iría la llamada real:
    // const response = await fetch(`${FAKE_API_URL}/${productId}`, { method: 'PUT', body: productData });
    // const updatedProduct = await response.json();
    // setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));

    // Simulación local
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const imageFile = productData.get('image') as File | null;
          return {
            ...p,
            name: productData.get('name') as string,
            description: productData.get('description') as string,
            price: Number(productData.get('price')),
            category: productData.get('category') as string,
            stock: Number(productData.get('stock')),
            image: imageFile ? URL.createObjectURL(imageFile) : p.image,
          };
        }
        return p;
      })
    );
  };

  const deleteProduct = async (productId: string) => {
    console.log(`Eliminando producto ${productId}`);
    // Aquí iría la llamada real (soft delete):
    // await fetch(`${FAKE_API_URL}/${productId}`, { method: 'PUT', body: JSON.stringify({ activo: false }) });
    
    // Simulación local
    setProducts((prev) => prev.filter((p) => p.id !== productId));
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
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};