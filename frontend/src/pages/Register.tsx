import { useState } from 'react';
import { registerUser } from '../api/auth';
import { LogIn } from 'lucide-react';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

export const Register = ({ onNavigate }: RegisterProps) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [matricula, setMatricula] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nombre || !correo || !password || !matricula) {
      setError('Todos los campos son requeridos.');
      return;
    }

    try {
      const data = await registerUser({ nombre, correo, password, matricula });
      setSuccess(data.msg);
      // Limpiar formulario
      setNombre('');
      setCorreo('');
      setPassword('');
      setMatricula('');
      // Opcional: redirigir a login después de un registro exitoso
      setTimeout(() => onNavigate('admin'), 2000);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error durante el registro.');
    }
  };

  return (
    <div className="min-h-screen bg-light flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full shadow-lg border-2 border-primary flex items-center justify-center" style={{ width: 140, height: 140 }}>
            <img src="/fecastor.png" alt="FECA" className="h-32 w-32 object-contain" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-dark text-center mb-6">
          Crear Cuenta
        </h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-dark">
              Nombre Completo
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-dark">
              Correo Institucional
            </label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="matricula" className="block text-sm font-medium text-dark">
              Matrícula
            </label>
            <input
              id="matricula"
              type="text"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Registrarse
          </button>
        </form>
        <p className="text-center text-sm text-dark mt-4">
          ¿Ya tienes una cuenta?{' '}
          <button onClick={() => onNavigate('admin')} className="font-medium text-primary hover:underline">
            Inicia Sesión
          </button>
        </p>
      </div>
    </div>
  );
};
