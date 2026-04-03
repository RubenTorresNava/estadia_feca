import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Package, BarChart3, ArrowLeft } from 'lucide-react';
import { AdminSummary } from '../components/AdminSummary';
import { AdminProducts } from '../components/AdminProducts';
import { AdminReports } from '../components/AdminReports';

interface AdminProps {
  onNavigate: (page: string) => void;
}

type AdminTab = 'summary' | 'products' | 'reports';


export const Admin = ({ onNavigate }: AdminProps) => {
  const { isAdmin, isAlumno, login, logout } = useAuth();
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('summary');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identificador || !password) {
      setError('Correo/matrícula y contraseña son requeridos.');
      return;
    }
    const success = await login(identificador, password);
    if (!success) {
      setError('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  if (!isAdmin && !isAlumno) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-sm text-dark/70 hover:text-primary transition-colors mb-4"
            title="Volver a la página principal"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full shadow-lg border-2 border-primary flex items-center justify-center" style={{ width: 140, height: 140 }}>
              <img src="/fecastor.png" alt="FECA" className="h-32 w-32 object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-dark text-center mb-6">
            Iniciar Sesión
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="identificador" className="block text-sm font-medium text-dark">
                Correo o Matrícula
              </label>
              <input
                id="identificador"
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                title="Ingresa tu correo institucional o matrícula"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                title="Ingresa tu contraseña"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              title="Iniciar sesión"
            >
              <LogOut className="h-4 w-4" />
              Iniciar Sesión
            </button>
          </form>
          <p className="text-center text-sm text-dark mt-4">
            ¿No tienes una cuenta?{' '}
            <button onClick={() => onNavigate('register')} className="font-medium text-primary hover:underline">
              Regístrate
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Si es alumno, la interfaz se maneja desde AppContent (MisCompras)

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