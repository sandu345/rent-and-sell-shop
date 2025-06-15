
export interface Customer {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  type: 'rent' | 'sale';
  items: OrderItem[];
  totalPrice: number;
  paidAmount: number;
  paymentRecords: PaymentRecord[];
  depositAmount?: number;
  courierMethod: 'pickme' | 'byhand' | 'bus';
  weddingDate: string;
  courierDate: string;
  returnDate?: string;
  createdAt: string;
}
