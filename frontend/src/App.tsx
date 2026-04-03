import { useState } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext'
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';
import { Register } from './pages/Register';
import { OrderConfirmation } from './components/OrderConfirmation';
import { History } from './pages/History';

import { useAuth } from './context/AuthContext';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any | null>(null);
  const { orders } = useCart();
  const { isAlumno, logout } = useAuth();

  const handleNavigate = (page: string, productId?: string) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCreated = (order: any) => {
    setLastCreatedOrder(order);
    setCurrentPage('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Si es alumno, permitir navegación entre catálogo, carrito, checkout e historial
  if (isAlumno) {
    const renderAlumnoPage = () => {
      switch (currentPage) {
        case 'home':
          return <Home onNavigate={handleNavigate} />;
        case 'catalog':
          return <Catalog onNavigate={handleNavigate} />;
        case 'product':
          return selectedProductId ? (
            <ProductDetail productId={selectedProductId} onNavigate={handleNavigate} />
          ) : (
            <Catalog onNavigate={handleNavigate} />
          );
        case 'cart':
          return <Cart onNavigate={handleNavigate} />;
        case 'checkout':
          return <Checkout onNavigate={handleNavigate} onOrderCreated={handleOrderCreated} />;
        case 'history':
        default:
          return <History onLogout={logout} />;
      }
    };
    return (
      <div className="flex flex-col min-h-screen">
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        <main className="flex-1">
          {renderAlumnoPage()}
        </main>
        <Footer />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'catalog':
        return <Catalog onNavigate={handleNavigate} />;
      case 'product':
        return selectedProductId ? (
          <ProductDetail productId={selectedProductId} onNavigate={handleNavigate} />
        ) : (
          <Catalog onNavigate={handleNavigate} />
        );
      case 'cart':
        return <Cart onNavigate={handleNavigate} />;
      case 'checkout':
        return <Checkout onNavigate={handleNavigate} onOrderCreated={handleOrderCreated} />;
      case 'admin':
        return <Admin onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'confirmation':
        return lastCreatedOrder ? (
          <OrderConfirmation order={lastCreatedOrder} onNavigate={handleNavigate} />
        ) : (
          <Home onNavigate={handleNavigate} />
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {currentPage !== 'admin' && currentPage !== 'confirmation' && (
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
      )}
      <main className="flex-1">{renderPage()}</main>
      {currentPage !== 'admin' && currentPage !== 'confirmation' && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;