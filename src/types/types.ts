
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
  isReturned?: boolean;
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
  isDispatched?: boolean;
  dispatchedDate?: string;
  isCancelled?: boolean;
  cancelledDate?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderId?: string;
  type: 'order_placed' | 'return_reminder' | 'payment_reminder' | 'overdue_reminder' | 'order_cancelled';
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  scheduledFor: string;
  sentAt?: string;
  createdAt: string;
}
