export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured?: boolean;
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
