
export type Category =
  | "Ropa"
  | "Accesorios"
  | "Papelería"
  | "Electrónica"
  | "Botellas y termos"
  | "Bolsas y mochilas"
  | "Stickers y pines"
  | "Otros";

export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock_actual: number;
  categoria: Category;
  activo: boolean;
  destacado: boolean;
  imagen_url: string;
}

export interface CartItem {
  product: Product; // Este se mantiene para la lógica del carrito
  cantidad: number;
  precio_unitario: number;
}

export interface Order {
  id: string;
  folio_referencia: string; // Antes reference
  nombre_alumno: string;    // Antes customerName
  matricula: string;        // Nueva
  correo: string;           // Antes customerEmail
  total_pago: number;       // Antes total
  estado: 'pendiente' | 'pagada' | 'cancelada'; // En español como tu ENUM
  fecha_creacion: string;
  detalles?: any[];         // Aquí vendrán los datos de detalle_orden
  comprobante_url?: string; // URL del comprobante de pago
}

export type Page =
  | "home"
  | "catalog"
  | "product"
  | "cart"
  | "checkout"
  | "admin";
