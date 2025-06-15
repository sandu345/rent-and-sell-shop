
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Calendar, Truck, DollarSign, Package } from 'lucide-react';
import { Order } from '@/types/types';

interface OrderListProps {
  orders: Order[];
  onEdit?: (order: Order) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onEdit }) => {
  const getStatusColor = (order: Order) => {
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
      {orders.map((order) => (
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
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>Total: ${order.totalPrice}</span>
                </div>
                {order.depositAmount && (
                  <span className="text-gray-600">Deposit: ${order.depositAmount}</span>
                )}
              </div>
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

            <div className="text-xs text-gray-500 pt-2 border-t">
              Created: {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
