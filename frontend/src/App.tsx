import { useEffect, useState } from 'react';
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
import { NotFound } from './pages/NotFound';

import { useAuth } from './context/AuthContext';

type AppPage =
  | 'home'
  | 'catalog'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'admin'
  | 'register'
  | 'confirmation'
  | 'history'
  | 'not-found';

type AppRoute = {
  page: AppPage;
  productId: string | null;
};

const normalizePath = (pathname: string) => {
  if (pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '') || '/';
};

const parseRoute = (pathname: string): AppRoute => {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === '/') return { page: 'home', productId: null };
  if (normalizedPath === '/catalog') return { page: 'catalog', productId: null };
  if (normalizedPath === '/cart') return { page: 'cart', productId: null };
  if (normalizedPath === '/checkout') return { page: 'checkout', productId: null };
  if (normalizedPath === '/admin' || normalizedPath === '/login') {
    return { page: 'admin', productId: null };
  }
  if (normalizedPath === '/register') return { page: 'register', productId: null };
  if (normalizedPath === '/history') return { page: 'history', productId: null };
  if (normalizedPath === '/confirmation') return { page: 'confirmation', productId: null };

  const productMatch = normalizedPath.match(/^\/(?:product|producto)\/([^/]+)$/);
  if (productMatch) {
    return { page: 'product', productId: decodeURIComponent(productMatch[1]) };
  }

  return { page: 'not-found', productId: null };
};

const getPathFromRoute = (page: AppPage, productId: string | null) => {
  switch (page) {
    case 'home':
      return '/';
    case 'catalog':
      return '/catalog';
    case 'product':
      return productId ? `/product/${encodeURIComponent(productId)}` : '/catalog';
    case 'cart':
      return '/cart';
    case 'checkout':
      return '/checkout';
    case 'admin':
      return '/login';
    case 'register':
      return '/register';
    case 'confirmation':
      return '/confirmation';
    case 'history':
      return '/history';
    case 'not-found':
      return '/404';
    default:
      return '/';
  }
};

function AppContent() {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname));
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any | null>(null);
  const { isAlumno, logout } = useAuth();
  const currentPage = route.page;

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string, productId?: string) => {
    const nextRoute: AppRoute = {
      page: page as AppPage,
      productId: productId ?? null,
    };

    setRoute(nextRoute);
    window.history.pushState(nextRoute, '', getPathFromRoute(nextRoute.page, nextRoute.productId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCreated = (order: any) => {
    setLastCreatedOrder(order);
    const nextRoute: AppRoute = { page: 'history', productId: null };
    setRoute(nextRoute);
    window.history.pushState(nextRoute, '', getPathFromRoute(nextRoute.page, nextRoute.productId));
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
          return route.productId ? (
            <ProductDetail productId={route.productId} onNavigate={handleNavigate} />
          ) : (
            <Catalog onNavigate={handleNavigate} />
          );
        case 'cart':
          return <Cart onNavigate={handleNavigate} />;
        case 'checkout':
          return <Checkout onNavigate={handleNavigate} onOrderCreated={handleOrderCreated} />;
        case 'history':
          return <History onLogout={logout} />;
        case 'not-found':
          return <NotFound onNavigate={handleNavigate} />;
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
        return route.productId ? (
          <ProductDetail productId={route.productId} onNavigate={handleNavigate} />
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
          <NotFound onNavigate={handleNavigate} />
        );
      case 'not-found':
        return <NotFound onNavigate={handleNavigate} />;
      default:
        return <NotFound onNavigate={handleNavigate} />;
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