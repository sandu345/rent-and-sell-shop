


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Package, Trash2, FileText, ArrowLeft, Loader2 } from 'lucide-react';
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
import { customerAPI } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOrders } from '@/hooks/useOrders';
import { InvoiceDialog } from '@/components/InvoiceDialog'; // ✅ Make sure this path is correct
import { Order } from '@/types/types';


interface Customer {
  _id: string;
  name: string;
  address: string;
  contactNumber: string;
  createdAt: string;
}

// interface Order {
//   _id: string;
//   customerId: string;
//   items: {
//     name: string;
//     price: number;
//     isReturned?: boolean;
//   }[];
//   totalAmount: number;
//   paidAmount: number;
//   depositAmount?: number;
//   type: 'rent' | 'sale';
//   isDispatched: boolean;
//   isCancelled: boolean;
//   isCompleted: boolean;
//   createdAt: string;
// }

export const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentNote, setPaymentNote] = useState('');
    const [billDialogOrder, setBillDialogOrder] = useState<Order | null>(null);
    const [billDialogOrdercus, setBillDialogOrdercus] = useState<Customer | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: ''
  });
const { addPayment,cancelOrder } = useOrders();
const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);


const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  // Load customer data
  useEffect(() => {
    console.log('====================================');
    console.log(`Loading customer profile for ID: ${id}`);
    console.log('====================================');
    const fetchCustomerData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('====================================');
        console.log(`Fetching customer data for ID: ${id}`);
        console.log('====================================');
        // Fetch customer details
        const customerResponse = await fetch(`${API_BASE}/api/customers/${id}`, {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!customerResponse.ok) {
          throw new Error('Customer not found');
        }

        const customerData = await customerResponse.json();
        setCustomer(customerData);
        setFormData({
          name: customerData.name,
          address: customerData.address,
          contactNumber: customerData.contactNumber
        });

        // Fetch customer orders
        const ordersResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/customer/${id}`, {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load customer data';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  const handleUpdate = async () => {
    if (!customer || !id) return;

    setUpdating(true);
    try {
      await customerAPI.updateCustomer(id, formData);
      setCustomer({ ...customer, ...formData });
      setIsEditMode(false);
      toast({
        title: "Success",
        description: "Customer details updated successfully."
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customer || !id) return;
    
    try {
      await customerAPI.deleteCustomer(id);
      toast({
        title: "Success",
        description: "Customer and associated orders deleted successfully."
      });
      navigate('/customers');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };



    const handleAddPayment = async (order: Order) => {
        if (order) {
      setPaymentOrder(order);
      setPaymentAmount(0);
      setPaymentNote('');
      setIsPaymentDialogOpen(true);
    }
    // This would open a payment dialog - placeholder for now
    console.log('Add payment for order:', order._id);
    };

    const handlePayment = async (e: React.FormEvent) => {
    console.log('Handling payment for order:', paymentOrder?._id);
    e.preventDefault();
  
    if (!paymentOrder || paymentAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount.",
        variant: "destructive"
      });
      return;
    }
  
    const remainingBalance = paymentOrder.totalAmount - paymentOrder.paidAmount;
    if (paymentAmount > remainingBalance) {
      toast({
        title: "Error",
        description: `Payment amount cannot exceed the remaining balance of Rs. ${remainingBalance}.`,
        variant: "destructive"
      });
      return;
    }
    console.log('Payment amount:', paymentAmount);

    console.log('Payment note:', paymentOrder._id);
    try {
      await addPayment(paymentOrder._id, paymentAmount, async () => {
        setIsDialogOpen(false);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsDialogOpen(true);
        console.log('Payment recorded successfully');
      });
  
      setIsPaymentDialogOpen(false);
      setPaymentAmount(0);
      setPaymentNote('');
      setPaymentOrder(null);
      
    // Update orders after a successful payment
    setOrders(prevOrders =>
    prevOrders.map(order => {
      if (order._id === paymentOrder._id) {
        return {
          ...order,
          paidAmount: order.paidAmount + paymentAmount
        };
      }
      return order;
    })
);


  
    } catch (err) {
      // already handled in addPayment
    }
  };



    const handleCancelOrder = async (orderId: string) => {
    try {
       await cancelOrder(orderId);
      setIsDialogOpen(false);

      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, isCancelled: true } : order
      ));

      toast({
        title: "Success",
        description: "Order cancelled successfully."
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
    };


    
  const handleMarkDispatched = async (order: Order) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${order._id}/dispatch`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark order as dispatched');
      }

      // Update local state
      setOrders(orders.map(o => 
        o._id === order._id ? { ...o, isDispatched: true } : o
      ));

      toast({
        title: "Success",
        description: "Order marked as dispatched."
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading customer profile...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error || 'Customer not found'}</div>
        <Button onClick={() => navigate('/customers')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate('/customers')} 
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Customer Profile</h1>
        </div>
        <div className="flex space-x-2">
<Button
  onClick={() => setShowInvoiceDialog(true)}
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditMode}
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                disabled={!isEditMode}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditMode}
            />
          </div>
          <div className="flex justify-end">
            {isEditMode ? (
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditMode(false);
                    setFormData({
                      name: customer.name,
                      address: customer.address,
                      contactNumber: customer.contactNumber
                    });
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update'
                  )}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Order History ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const balance = order.totalAmount - order.paidAmount;
                const isFullyPaid = balance === 0;
                const isCancelled = order.isCancelled;
                
                return (
                  <div 
                    key={order._id} 
                    className={`border rounded-lg p-4 ${isCancelled ? 'opacity-70 bg-gray-50' : 'hover:shadow-md transition-shadow'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${isCancelled ? 'line-through' : ''}`}>
                          Order #{order._id.slice(-8)}
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
                            {!order.isDispatched && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkDispatched(order)}
                              >
                                Mark Dispatched
                              </Button>
                            )}
                            {balance > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddPayment(order)}
                              >
                                Add Payment
                              </Button>
                            )}
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
                                    onClick={() => handleCancelOrder(order._id)}
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
                          <span className="font-medium">Rs. {order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid:</span>
                          <span className="text-green-600">Rs. {order.paidAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Balance:</span>
                          <span className={order.totalAmount - order.paidAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                            Rs. {order.totalAmount - order.paidAmount}
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
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment</DialogTitle>
                </DialogHeader>
                {paymentOrder && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium">Order Summary</h4>
                      <p className="text-sm text-gray-600">Customer: {paymentOrder.customer}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-medium">Rs. {paymentOrder.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paid Amount:</span>
                          <span className="font-medium text-green-600">Rs. {paymentOrder.paidAmount}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span>Balance:</span>
                          <span className="font-medium text-red-600">Rs. {paymentOrder.totalAmount - paymentOrder.paidAmount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <form onSubmit={handlePayment} className="space-y-4">
                      <div>
                        <Label htmlFor="paymentAmount">Payment Amount (Rs.)</Label>
                        <Input
                          id="paymentAmount"
                          type="number"
                          value={paymentAmount || ''}
                          onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                          placeholder="Enter payment amount"
                          max={paymentOrder.totalAmount - paymentOrder.paidAmount}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="paymentNote">Note (Optional)</Label>
                        <Input
                          id="paymentNote"
                          value={paymentNote}
                          onChange={(e) => setPaymentNote(e.target.value)}
                          placeholder="Payment note"
                        />
                      </div>
      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                          Record Payment
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </DialogContent>
            </Dialog>
      {showInvoiceDialog && customer && (
  <InvoiceDialog
    customer={customer}
    orders={orders}
        isOpen={showInvoiceDialog}
    onOpenChange={setShowInvoiceDialog}
  />
)}

    </div>
    
  );
};

