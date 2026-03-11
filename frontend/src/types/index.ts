export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock_actual: number;
  categoria: string;
  activo: boolean;
  imagen_url: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  reference: string;
  status: "pending" | "paid" | "cancelled";
  createdAt: string;
  expiresAt: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: "credit_card" | "debit_card";
}

export type Page =
  | "home"
  | "catalog"
  | "product"
  | "cart"
  | "checkout"
  | "admin";
