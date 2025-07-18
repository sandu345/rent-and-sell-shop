
export interface Customer {
  _id: string;
  name: string;
  address: string;
  contactNumber: string;
  createdAt: string;
}

// export interface OrderItem {
//   id: string;
//   name: string;
//   price: number;
//   isReturned?: boolean;
// }

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

// export interface Order {
//   id: string;
//   customerId: string;
//   customerName: string;
//   type: 'rent' | 'sale';
//   items: OrderItem[];
//   totalPrice: number;
//   paidAmount: number;
//   paymentRecords: PaymentRecord[];
//   depositAmount?: number;
//   isDepositRefunded?: boolean;
//   depositRefundedDate?: string;
//   courierMethod: 'pickme' | 'byhand' | 'bus';
//   weddingDate: string;
//   courierDate: string;
//   returnDate?: string;
//   isDispatched?: boolean;
//   dispatchedDate?: string;
//   isCancelled?: boolean;
//   cancelledDate?: string;
//   createdAt: string;
// }



// export interface Order {
//   totalPrice: number;
//   _id: string;
//   customer: string; // Customer ID
//   customerName: string;
//   orderType: 'rent' | 'sale';
//   items: OrderItem[];
//   totalAmount: number;
//   paidAmount: number;
//   toBePaidAmount: number;
//   depositAmount?: number;
//   paymentMethod: 'pickme' | 'byhand' | 'bus';
//   weddingDate: string;
//   courierDate: string;
//   returnDate?: string;
//   isDispatched: boolean;
//   isCompleted: boolean;
//   isDepositRefunded?: boolean;
//   createdAt: string;
//   dispatchedDate: string;
//   depositRefundedDate?: string;
//   isCancelled: boolean;
// }

export interface Order {
  _id: string;
  customer: string; // Customer ID
  customerName: string;
  type: 'rent' | 'sale';
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  toBePaidAmount: number;
  depositAmount?: number;
  courierMethod: 'pickme' | 'byhand' | 'bus';
  weddingDate: string;
  courierDate: string;
  returnDate?: string;
  isDispatched: boolean;
  isCompleted: boolean;
  isDepositRefunded?: boolean;
  createdAt: string;
  dispatchedDate: string;
  depositRefundedDate?: string;
  isCancelled: boolean;
}

export interface OrderType {
  _id: string;
  customer: string; // Customer ID
  customerName: string;
  type: 'rent' | 'sale';
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  toBePaidAmount: number;
  depositAmount?: number;
  courierMethod: 'pickme' | 'byhand' | 'bus';
  weddingDate: string;
  courierDate: string;
  returnDate?: string;
  isDispatched: boolean;
  isCompleted: boolean;
  isDepositRefunded?: boolean;
  createdAt: string;
  dispatchedDate: string;
  depositRefundedDate?: string;
  isCancelled: boolean;
}


export interface OrderItem {
  _id: string;
  name: string;
  price: number;
  isReturned: boolean;
  returnedAt?: string;
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
