import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Package, Trash2, FileText } from 'lucide-react';
import { Customer, Order } from '@/types/types';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { InvoiceDialog } from '@/components/InvoiceDialog';
import { EditOrderDialog } from '@/components/EditOrderDialog';

interface CustomerProfileProps {
  customers: Customer[];
  orders: Order[];
  onUpdateCustomer: (id: string, customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onEditOrder: (id: string, orderData: Omit<Order, 'id' | 'createdAt'>) => void;
  onAddPayment: (order: Order) => void;
  onMarkDispatched: (order: Order) => void;
  onDeleteCustomer: (id: string) => void;
  onCancelOrder: (id: string) => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ 
  customers, 
  orders, 
  onUpdateCustomer, 
  onEditOrder,
  onAddPayment,
  onMarkDispatched,
  onDeleteCustomer,
  onCancelOrder
}) => {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [editOrderDialogOpen, setEditOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Extract customerId from the URL
    const pathSegments = window.location.pathname.split('/');
    const idFromUrl = pathSegments[pathSegments.length - 1];
    setCustomerId(idFromUrl);
  }, []);

  useEffect(() => {
    if (customerId) {
      const foundCustomer = customers.find(c => c.id === customerId);
      setCustomer(foundCustomer || null);

      if (foundCustomer) {
        setName(foundCustomer.name);
        setAddress(foundCustomer.address);
        setContactNumber(foundCustomer.contactNumber);
      }
    }
  }, [customerId, customers]);

  const handleUpdate = () => {
    if (!customer) return;

    const updatedCustomer = {
      name,
      address,
      contactNumber
    };

    onUpdateCustomer(customer.id, updatedCustomer);
    setCustomer({ ...customer, ...updatedCustomer });
    setIsEditMode(false);

    toast({
      title: "Customer updated",
      description: "Customer details have been updated successfully."
    });
  };

  const handleDeleteCustomer = () => {
    if (!customer) return;
    
    onDeleteCustomer(customer.id);
    toast({
      title: "Customer deleted",
      description: "Customer has been deleted successfully."
    });
    
    // Navigate back to customers page
    window.location.href = '/customers';
  };

  const handleCancelOrder = (orderId: string) => {
    onCancelOrder(orderId);
    toast({
      title: "Order cancelled",
      description: "Order has been cancelled successfully."
    });
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditOrderDialogOpen(true);
  };

  const handleSaveOrder = (orderId: string, orderData: Omit<Order, 'id' | 'createdAt'>) => {
    onEditOrder(orderId, orderData);
    setEditOrderDialogOpen(false);
    setSelectedOrder(null);
    toast({
      title: "Order updated",
      description: "Order has been updated successfully."
    });
  };

  const customerOrders = orders.filter(order => order.customerId === customerId);

  if (!customer) {
    return <div className="text-center py-8">Customer not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Customer Profile</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setInvoiceDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Customer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the customer and all associated orders. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditMode}
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                disabled={!isEditMode}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!isEditMode}
            />
          </div>
          <div className="flex justify-end">
            {isEditMode ? (
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate}>Update</Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditMode(true)}>Edit Details</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerOrders.length > 0 ? (
            <div className="space-y-4">
              {customerOrders.map((order) => {
                const balance = order.totalPrice - order.paidAmount;
                const isFullyPaid = balance === 0;
                const isCancelled = order.isCancelled;
                
                return (
                  <div 
                    key={order.id} 
                    className={`border rounded-lg p-4 ${isCancelled ? 'opacity-70 bg-gray-50' : 'hover:shadow-md transition-shadow'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${isCancelled ? 'line-through' : ''}`}>
                          Order #{order.id.slice(-8)}
                        </span>
                        {isCancelled ? (
                          <Badge variant="destructive">Cancelled</Badge>
                        ) : (
                          <Badge variant={order.type === 'rent' ? 'default' : 'secondary'}>
                            {order.type}
                          </Badge>
                        )}
                        {!isCancelled && order.isDispatched && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Dispatched
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm text-gray-500 ${isCancelled ? 'line-through' : ''}`}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        {!isCancelled && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditOrder(order)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  Cancel Order
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this order? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Yes, Cancel Order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 text-sm ${isCancelled ? 'line-through' : ''}`}>
                      <div>
                        <span className="text-gray-600">Items:</span>
                        <ul className="mt-1">
                          {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span>{item.name}</span>
                              <span>Rs. {item.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-medium">Rs. {order.totalPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid:</span>
                          <span className="text-green-600">Rs. {order.paidAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Balance:</span>
                          <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
                            Rs. {balance}
                          </span>
                        </div>
                        {order.type === 'rent' && order.depositAmount && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Deposit:</span>
                            <span className="text-blue-600">Rs. {order.depositAmount}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="text-gray-600">Status:</div>
                        <div className="mt-1 space-y-1">
                          {isCancelled ? (
                            <Badge variant="destructive" className="text-xs">
                              Order Cancelled
                            </Badge>
                          ) : (
                            <>
                              <Badge 
                                variant={isFullyPaid ? 'default' : 'destructive'} 
                                className="text-xs mr-1"
                              >
                                {isFullyPaid ? 'Paid' : 'Pending Payment'}
                              </Badge>
                              {order.type === 'rent' && (
                                <>
                                  {order.items.every(item => item.isReturned) ? (
                                    <Badge variant="default" className="text-xs">
                                      Returned
                                    </Badge>
                                  ) : order.items.some(item => item.isReturned) ? (
                                    <Badge variant="secondary" className="text-xs">
                                      Partial Return
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="text-xs">
                                      Not Returned
                                    </Badge>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No orders found for this customer.</p>
          )}
        </CardContent>
      </Card>

      {/* Invoice Dialog */}
      {customer && (
        <InvoiceDialog
          isOpen={invoiceDialogOpen}
          onOpenChange={setInvoiceDialogOpen}
          customer={customer}
          orders={customerOrders}
        />
      )}

      {/* Edit Order Dialog */}
      <EditOrderDialog
        order={selectedOrder}
        open={editOrderDialogOpen}
        onOpenChange={setEditOrderDialogOpen}
        onSave={handleSaveOrder}
      />
    </div>
  );
};
