import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header = ({ onNavigate, currentPage }: HeaderProps) => {
  const { getCartItemsCount } = useCart();
  const { isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = getCartItemsCount();

  const navItems = [
    { id: "home", label: "Inicio" },
    { id: "catalog", label: "Catálogo" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center rounded-xl px-1 transition-transform hover:scale-[1.01]"
              title="Ir a inicio"
            >
              <img
                src="/fecastor.png"
                alt="FECA Store Logo"
                className="h-14 w-auto"
              />
            </button>
          </div>
          <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-black/5 bg-white px-2 py-1 shadow-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  currentPage === item.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-dark hover:bg-light"
                }`}
                title={item.id === 'home' ? 'Ir a inicio' : item.id === 'catalog' ? 'Ver catálogo' : item.label}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate("cart")}
              className="relative rounded-xl p-2 text-dark hover:bg-light hover:text-primary transition-colors"
              title="Ver carrito"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate("admin")}
              className={`rounded-xl p-2 transition-colors ${
                isAdmin ? "bg-primary/10 text-primary" : "text-dark hover:bg-light hover:text-primary"
              }`}
              title="Panel de administración"
            >
              <User className="h-6 w-6" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-xl p-2 text-dark hover:bg-light"
              title={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray/20 py-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left rounded-lg px-4 py-2 text-sm font-medium ${
                  currentPage === item.id
                    ? "text-primary bg-light"
                    : "text-dark hover:bg-light"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
