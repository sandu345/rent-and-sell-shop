
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, Truck, DollarSign, Package, CheckCircle, Printer } from 'lucide-react';
import { Order, Customer } from '@/types/types';
import { BillDialog } from '@/components/BillDialog';
import { toast } from '@/hooks/use-toast';

interface OrderProfileProps {
  orders: Order[];
  customers: Customer[];
  onEditOrder: (id: string, order: Omit<Order, 'id' | 'createdAt'>) => void;
  onAddPayment: (order: Order) => void;
  onMarkDispatched: (order: Order) => void;
}

export const OrderProfile: React.FC<OrderProfileProps> = ({ 
  orders, 
  customers, 
  onEditOrder, 
  onAddPayment, 
  onMarkDispatched 
}) => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [billDialogOrder, setBillDialogOrder] = useState<Order | null>(null);

  const order = orders.find(o => o.id === orderId);
  const customer = customers.find(c => c.id === order?.customerId);

  if (!order || !customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <Button onClick={() => navigate('/orders')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const getStatusColor = (order: Order) => {
    if (order.isDispatched) {
      return 'bg-gray-100 text-gray-800';
    }
    
    const today = new Date();
    const courierDate = new Date(order.courierDate);
    
    if (courierDate < today && courierDate.toDateString() !== today.toDateString()) {
      return 'bg-red-100 text-red-800';
    }
    if (courierDate.toDateString() === today.toDateString()) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (order: Order) => {
    if (order.isDispatched) {
      return 'Dispatched';
    }
    
    const today = new Date();
    const courierDate = new Date(order.courierDate);
    
    if (courierDate < today && courierDate.toDateString() !== today.toDateString()) {
      return 'Dispatch Overdue';
    }
    if (courierDate.toDateString() === today.toDateString()) {
      return 'Dispatch Today';
    }
    return 'Scheduled';
  };

  const getPaymentStatus = (order: Order) => {
    const balance = order.totalPrice - order.paidAmount;
    if (balance === 0) return { text: 'Paid', color: 'bg-green-100 text-green-800' };
    if (order.paidAmount === 0) return { text: 'Unpaid', color: 'bg-red-100 text-red-800' };
    return { text: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
  };

  const handleMarkDispatched = () => {
    onMarkDispatched(order);
    toast({
      title: "Order dispatched",
      description: "Order has been marked as dispatched."
    });
  };

  const handleAddPayment = () => {
    onAddPayment(order);
  };

  const handlePrintBill = () => {
    setBillDialogOrder(order);
  };

  const paymentStatus = getPaymentStatus(order);
  const balance = order.totalPrice - order.paidAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/orders')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(-8)}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handlePrintBill}
            variant="outline"
            className="bg-green-50 hover:bg-green-100"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Bill
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
        </div>
      </div>

      {/* Order Status */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge className={getStatusColor(order)}>
              {getStatusText(order)}
            </Badge>
            <Badge className={paymentStatus.color}>
              {paymentStatus.text}
            </Badge>
            <Badge variant={order.type === 'rent' ? 'default' : 'secondary'}>
              {order.type === 'rent' ? 'Rental' : 'Sale'}
            </Badge>
            {order.isCancelled && (
              <Badge variant="destructive">
                Cancelled
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-gray-900">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="text-gray-900">{customer.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Contact Number</p>
            <p className="text-gray-900">{customer.contactNumber}</p>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <span className={item.isReturned ? 'line-through text-gray-500' : ''}>{item.name}</span>
                    {item.isReturned && (
                      <Badge variant="outline" className="text-green-600">
                        Returned
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium">Rs. {item.price}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold">Rs. {order.totalPrice}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Paid Amount:</span>
                <span className="font-medium">Rs. {order.paidAmount}</span>
              </div>
              <div className="flex justify-between text-red-600 border-t pt-2">
                <span>Balance:</span>
                <span className="font-bold">Rs. {balance}</span>
              </div>
              {order.depositAmount && (
                <div className="flex justify-between text-blue-600">
                  <span>Deposit:</span>
                  <span className="font-medium">Rs. {order.depositAmount}</span>
                </div>
              )}
              {order.isDepositRefunded && (
                <div className="text-sm text-green-600">
                  Deposit refunded on {order.depositRefundedDate ? new Date(order.depositRefundedDate).toLocaleDateString() : 'N/A'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dates and Delivery */}
      <Card>
        <CardHeader>
          <CardTitle>Important Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Wedding Date</span>
              </div>
              <p className="font-medium">{new Date(order.weddingDate).toLocaleDateString()}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-gray-600 mb-1">
                <Truck className="h-4 w-4" />
                <span className="text-sm">Courier Date</span>
              </div>
              <p className="font-medium">{new Date(order.courierDate).toLocaleDateString()}</p>
            </div>
            {order.returnDate && (
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Return Date</span>
                </div>
                <p className="font-medium">{new Date(order.returnDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Courier Method</p>
            <p className="font-medium capitalize">{order.courierMethod}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {!order.isCancelled && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {!order.isDispatched && (
                <Button
                  onClick={handleMarkDispatched}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Dispatched
                </Button>
              )}
              {balance > 0 && (
                <Button
                  onClick={handleAddPayment}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Order Created:</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            {order.isDispatched && order.dispatchedDate && (
              <div className="flex justify-between text-green-600">
                <span>Dispatched:</span>
                <span>{new Date(order.dispatchedDate).toLocaleDateString()}</span>
              </div>
            )}
            {order.isCancelled && order.cancelledDate && (
              <div className="flex justify-between text-red-600">
                <span>Cancelled:</span>
                <span>{new Date(order.cancelledDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {billDialogOrder && (
        <BillDialog
          isOpen={!!billDialogOrder}
          onOpenChange={(open) => !open && setBillDialogOrder(null)}
          customer={customer}
          order={billDialogOrder}
        />
      )}
    </div>
  );
};
