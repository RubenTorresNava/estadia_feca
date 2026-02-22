export const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src="/fecastor.png" alt="FECA" className="h-10 w-10" />
              <span className="text-lg font-bold">FECA Store</span>
            </div>
            <p className="text-gray text-sm">
              Tienda oficial de merchandising de la Facultad de Economía,
              Contaduría y Administración - UJED
            </p>
          </div>


          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray">
              <li>Dirección: Fanny Anitua s/n, Los Ángeles, 34000 Durango, Dgo.</li>
              <li>Teléfono: 618 827 1365</li>
              <li>atencionusuarios@ujed.mx</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Horarios</h3>
            <ul className="space-y-2 text-sm text-gray">
              <li>Lunes a Viernes</li>
              <li>8:00 AM - 5:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray/20 mt-8 pt-8 text-center text-sm text-gray">
        <p> &copy; {new Date().getFullYear()} FECA UJED. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
