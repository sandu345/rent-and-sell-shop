
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Calendar, Truck, DollarSign, Package, Plus, CheckCircle } from 'lucide-react';
import { Order } from '@/types/types';

interface OrderListProps {
  orders: Order[];
  onEdit?: (order: Order) => void;
  onAddPayment?: (order: Order) => void;
  onMarkDispatched?: (order: Order) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onEdit, onAddPayment, onMarkDispatched }) => {
  const getStatusColor = (order: Order) => {
    if (order.isDispatched) {
      return 'bg-gray-100 text-gray-800';
    }
    
    const today = new Date();
    const courierDate = new Date(order.courierDate);
    const returnDate = order.returnDate ? new Date(order.returnDate) : null;
    
    if (courierDate < today && courierDate.toDateString() !== today.toDateString()) {
      return 'bg-red-100 text-red-800';
    }
    if (order.type === 'rent' && returnDate && returnDate < today && returnDate.toDateString() !== today.toDateString()) {
      return 'bg-red-100 text-red-800';
    }
    if (courierDate.toDateString() === today.toDateString()) {
      return 'bg-orange-100 text-orange-800';
    }
    if (order.type === 'rent' && returnDate && returnDate.toDateString() === today.toDateString()) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (order: Order) => {
    if (order.isDispatched) {
      return 'Dispatched';
    }
    
    const today = new Date();
    const courierDate = new Date(order.courierDate);
    const returnDate = order.returnDate ? new Date(order.returnDate) : null;
    
    if (courierDate < today && courierDate.toDateString() !== today.toDateString()) {
      return 'Dispatch Overdue';
    }
    if (order.type === 'rent' && returnDate && returnDate < today && returnDate.toDateString() !== today.toDateString()) {
      return 'Return Overdue';
    }
    if (courierDate.toDateString() === today.toDateString()) {
      return 'Dispatch Today';
    }
    if (order.type === 'rent' && returnDate && returnDate.toDateString() === today.toDateString()) {
      return 'Return Today';
    }
    return 'Scheduled';
  };

  const getPaymentStatus = (order: Order) => {
    const balance = order.totalPrice - order.paidAmount;
    if (balance === 0) return { text: 'Paid', color: 'bg-green-100 text-green-800' };
    if (order.paidAmount === 0) return { text: 'Unpaid', color: 'bg-red-100 text-red-800' };
    return { text: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No orders to display</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {orders.map((order) => {
        const paymentStatus = getPaymentStatus(order);
        const balance = order.totalPrice - order.paidAmount;
        
        return (
          <Card key={order.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{order.customerName}</CardTitle>
                  <p className="text-sm text-gray-600">Order #{order.id.slice(-8)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(order)}>
                    {getStatusText(order)}
                  </Badge>
                  <Badge className={paymentStatus.color}>
                    {paymentStatus.text}
                  </Badge>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(order)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={order.type === 'rent' ? 'default' : 'secondary'}>
                  {order.type === 'rent' ? 'Rental' : 'Sale'}
                </Badge>
                <span className="text-sm font-medium capitalize">{order.courierMethod}</span>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Items:</strong> {order.items.map(item => item.name).join(', ')}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-bold">Rs. {order.totalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Paid Amount:</span>
                    <span className="text-green-600 font-medium">Rs. {order.paidAmount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-1">
                    <span className="text-red-600">Balance:</span>
                    <span className="text-red-600 font-bold">Rs. {balance}</span>
                  </div>
                </div>

                {order.depositAmount && (
                  <div className="text-sm text-gray-600">
                    <span>Deposit: Rs. {order.depositAmount}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Wedding</span>
                  </div>
                  <p className="font-medium">{new Date(order.weddingDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>Courier</span>
                  </div>
                  <p className="font-medium">{new Date(order.courierDate).toLocaleDateString()}</p>
                </div>
              </div>

              {order.returnDate && (
                <div className="text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Return Date</span>
                  </div>
                  <p className="font-medium">{new Date(order.returnDate).toLocaleDateString()}</p>
                </div>
              )}

              {order.isDispatched && order.dispatchedDate && (
                <div className="text-sm text-green-600">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Dispatched on {new Date(order.dispatchedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t space-y-2">
                {!order.isDispatched && onMarkDispatched && (
                  <Button
                    onClick={() => onMarkDispatched(order)}
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Dispatched
                  </Button>
                )}
                
                {balance > 0 && onAddPayment && (
                  <Button
                    onClick={() => onAddPayment(order)}
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-500 pt-2 border-t">
                Created: {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
