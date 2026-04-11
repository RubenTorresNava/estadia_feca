import { AlertTriangle, ArrowLeft, Home, ShoppingBag } from 'lucide-react';

interface NotFoundProps {
  onNavigate: (page: string) => void;
}

export const NotFound = ({ onNavigate }: NotFoundProps) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(230,236,245,0.9),_rgba(248,250,252,1)_45%,_rgba(241,245,249,1)_100%)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Página no encontrada
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-dark sm:text-5xl">
                La ruta que buscas no existe.
              </h1>
              <p className="max-w-xl text-base leading-7 text-dark/70 sm:text-lg">
                Puede que la dirección haya cambiado, esté mal escrita o que la página haya sido movida.
                Usa una de estas acciones para volver a la tienda.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                <Home className="h-4 w-4" />
                Ir al inicio
              </button>
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 font-semibold text-dark transition-colors hover:bg-light"
              >
                <ShoppingBag className="h-4 w-4" />
                Ver catálogo
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-2 text-sm font-medium text-dark/60 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              ¿Buscabas iniciar sesión?
            </button>
          </div>

          <div className="relative hidden overflow-hidden bg-[linear-gradient(160deg,_#0f172a_0%,_#1e293b_55%,_#dc2626_100%)] p-10 text-white lg:block">
            <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />

            <div className="relative flex h-full min-h-[28rem] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-amber-400" />
              </div>
              <p className="text-center text-sm text-white/80">
                Si crees que esto no debería pasar, contáctanos para que podamos solucionarlo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};