import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, User, Phone, MapPin, Calendar, Package, FileText } from 'lucide-react';
import { Customer, Order } from '@/types/types';
import { OrderList } from '@/components/OrderList';
import { InvoiceDialog } from '@/components/InvoiceDialog';

interface CustomerProfileProps {
  customers: Customer[];
  orders: Order[];
  onEditCustomer: (id: string, customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onEditOrder: (id: string, order: Omit<Order, 'id' | 'createdAt'>) => void;
  onAddPayment: (order: Order) => void;
  onMarkDispatched: (order: Order) => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customers,
  orders,
  onEditCustomer,
  onEditOrder,
  onAddPayment,
  onMarkDispatched
}) => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  
  const customer = customers.find(c => c.id === customerId);
  const customerOrders = orders.filter(order => order.customerId === customerId);
  
  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Customer not found</p>
        <Button onClick={() => navigate('/customers')} className="mt-4">
          Back to Customers
        </Button>
      </div>
    );
  }

  const totalOrders = customerOrders.length;
  const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalPaid = customerOrders.reduce((sum, order) => sum + order.paidAmount, 0);
  const totalBalance = totalSpent - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/customers')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Customer Profile</h1>
        </div>
        <Button
          onClick={() => setIsInvoiceDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Details Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Details</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/customers`)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{customer.name}</h3>
            </div>
            
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">{customer.address}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{customer.contactNumber}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Registered: {new Date(customer.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Statistics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Order Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Rs. {totalSpent}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Rs. {totalPaid}</div>
                <div className="text-sm text-gray-600">Total Paid</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">Rs. {totalBalance}</div>
                <div className="text-sm text-gray-600">Balance Due</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle>Order History ({customerOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {customerOrders.length > 0 ? (
            <OrderList 
              orders={customerOrders}
              onEdit={(order) => {
                // Navigate to orders page with edit dialog
                navigate('/orders', { state: { editOrder: order } });
              }}
              onAddPayment={onAddPayment}
              onMarkDispatched={onMarkDispatched}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No orders found for this customer</p>
              <Button 
                onClick={() => navigate('/orders')} 
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Create First Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <InvoiceDialog
        isOpen={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        customer={customer}
        orders={customerOrders}
      />
    </div>
  );
};
