import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

interface MisComprasProps {
  onLogout: () => void;
}

export const History = ({ onLogout }: MisComprasProps) => {
  const { usuario } = useAuth();

  return (
    <div className="min-h-screen bg-light flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-dark mb-4">¡Bienvenido, {usuario?.nombre}!</h1>
        <p className="mb-6">
          Has iniciado sesión como <span className="font-semibold text-primary">alumno</span>.<br/>
          Próximamente podrás ver tus compras y subir comprobantes desde aquí.
        </p>
        <button
          onClick={onLogout}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors mt-4"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
