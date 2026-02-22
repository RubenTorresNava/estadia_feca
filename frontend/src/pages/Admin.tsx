import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Package, BarChart3 } from 'lucide-react';
import { AdminSummary } from '../components/AdminSummary';
import { AdminProducts } from '../components/AdminProducts';
import { AdminReports } from '../components/AdminReports';

interface AdminProps {
  onNavigate: (page: string) => void;
}

type AdminTab = 'summary' | 'products' | 'reports';

export const Admin = ({ onNavigate }: AdminProps) => {
  const { isAdmin, login, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('summary');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (!success) {
      setError('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <img src="/fecastor.png" alt="FECA" className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold text-dark text-center mb-6">
            Panel de Administración
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ingresa la contraseña"
              />
              {error && <p className="text-primary text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Iniciar Sesión
            </button>
            <p className="text-xs text-gray text-center mt-4">
              Demo: usa la contraseña "feca2024"
            </p>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return <AdminSummary />;
      case 'products':
        return <AdminProducts />;
      case 'reports':
        return <AdminReports />;
      default:
        return <AdminSummary />;
    }
  };

  const navItems = [
    { id: 'summary', label: 'Resumen', icon: LayoutDashboard },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-light">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-dark">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-56">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AdminTab)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary text-white'
                        : 'text-dark hover:bg-gray/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
          <main className="flex-1">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};