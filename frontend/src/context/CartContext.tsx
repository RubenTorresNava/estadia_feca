import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, Order } from '../types';
import api from '../api/api';

interface CartContextType {
  cart: CartItem[];
  orders: Order[];
  addToCart: (product: Product, cantidad: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
  createOrder: (order: Order) => void;
  confirmOrder: (orderId: string) => Promise<void>;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('feca-cart');
    return saved ? JSON.parse(saved) : [];
});

  const [orders, setOrders] = useState<Order[]>([]);

const fetchOrders = async () => {
  try {
    const response = await api.get('/administrador/obtenerOrdenes');
    const rawData = response.data.ordenes || response.data;

    const validatedOrders = rawData.map((o: any) => ({
      id: o.id.toString(),
      detalles: (o.detalles || []).map((d: any) => ({
        ...d,
        nombre: d.producto?.nombre || 'Producto', 
        precio_unitario: parseFloat(d.precio_unitario) || 0
      }))
    }));

    setOrders(validatedOrders);
  } catch (err) {
    console.error("Error al cargar órdenes:", err);
  }
};

    useEffect(() => {
      const token = localStorage.getItem('feca-admin-token');
      if (token) {
        fetchOrders();
      }
  },[]);

  const addToCart = (product: Product, cantidad: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { product, cantidad }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, cantidad } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

const createOrder = async (orderData: any) => {
  try {
    const response = await api.post('checkout/', orderData);
    
    const ordenFinal = response.data.nuevaOrden;

    if (ordenFinal) {
      clearCart();
      return ordenFinal;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

  const confirmOrder = async (orderId: string) => {
    try {
      await api.put(`/administrador/${orderId}/pago-confirmado`, {status: 'pagado'});
      setOrders((prev) => prev.map((order) =>
        order.id === orderId ? { ...order, status: 'pagado' } : order
      ));

    } catch (err) {
      console.error('Error al confirmar la orden:', err);
      throw err;
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.precio * item.cantidad, 0);
    
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.cantidad, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        createOrder,
        confirmOrder,
        getCartTotal,
        getCartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
