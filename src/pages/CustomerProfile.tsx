import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Edit, Plus, DollarSign, Package, Calendar, Truck, FileText, Trash2, X, Printer } from 'lucide-react';
import { Customer, Order, PaymentRecord } from '@/types/types';
import { InvoiceDialog } from '@/components/InvoiceDialog';
import { BillDialog } from '@/components/BillDialog';
import { toast } from '@/hooks/use-toast';

interface CustomerProfileProps {
  customers: Customer[];
  orders: Order[];
  onEditCustomer: (id: string, customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onEditOrder: (id: string, order: Omit<Order, 'id' | 'createdAt'>) => void;
  onAddPayment: (order: Order) => void;
  onMarkDispatched: (order: Order) => void;
  onDeleteCustomer: (id: string) => void;
  onCancelOrder: (id: string) => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ 
  customers, 
  orders, 
  onEditCustomer, 
  onEditOrder, 
  onAddPayment, 
  onMarkDispatched,
  onDeleteCustomer,
  onCancelOrder
}) => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [billDialogOrder, setBillDialogOrder] = useState<Order | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNote, setPaymentNote] = useState('');
  const [isEditOrderDialogOpen, setIsEditOrderDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'rent' as 'rent' | 'sale',
    items: [{ name: '', price: 0 }],
    paidAmount: 0,
    depositAmount: 0,
    courierMethod: 'pickme' as 'pickme' | 'byhand' | 'bus',
    weddingDate: '',
    courierDate: '',
    returnDate: ''
  });

  const customer = customers.find(c => c.id === customerId);
  const customerOrders = orders.filter(order => order.customerId === customerId);
  
  // Filter out cancelled orders for financial calculations
  const activeCustomerOrders = customerOrders.filter(order => !order.isCancelled);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h2>
        <Button onClick={() => navigate('/customers')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const totalOrders = activeCustomerOrders.length;
  const totalSpent = activeCustomerOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalPaid = activeCustomerOrders.reduce((sum, order) => sum + order.paidAmount, 0);
  const totalBalance = totalSpent - totalPaid;

  const handleDeleteCustomer = () => {
    onDeleteCustomer(customer.id);
    toast({
      title: "Customer deleted",
      description: "Customer has been deleted successfully."
    });
    navigate('/customers');
  };

  const handleCancelOrder = (orderId: string) => {
    onCancelOrder(orderId);
    toast({
      title: "Order cancelled",
      description: "Order has been cancelled successfully."
    });
  };

  const handleNewOrder = () => {
    navigate('/orders');
  };

  const handlePrintBill = (order: Order) => {
    setBillDialogOrder(order);
  };

  const handleAddPayment = (order: Order) => {
    setPaymentOrder(order);
    setPaymentAmount(0);
    setPaymentNote('');
    setIsPaymentDialogOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      type: order.type,
      items: order.items.map(item => ({ name: item.name, price: item.price })),
      paidAmount: order.paidAmount,
      depositAmount: order.depositAmount || 0,
      courierMethod: order.courierMethod,
      weddingDate: order.weddingDate,
      courierDate: order.courierDate,
      returnDate: order.returnDate || ''
    });
    setIsEditOrderDialogOpen(true);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingOrder) return;

    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a valid customer.",
        variant: "destructive"
      });
      return;
    }

    const validItems = formData.items.filter(item => item.name.trim() && item.price > 0);
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item with name and price.",
        variant: "destructive"
      });
      return;
    }

    const totalPrice = validItems.reduce((sum, item) => sum + item.price, 0);
    
    const orderData = {
      customerId: formData.customerId,
      customerName: selectedCustomer.name,
      type: formData.type,
      items: validItems.map((item, index) => ({ 
        ...item, 
        id: `${Date.now()}_${index}`,
        isReturned: false
      })),
      totalPrice,
      paidAmount: formData.paidAmount,
      paymentRecords: editingOrder.paymentRecords,
      depositAmount: formData.type === 'rent' ? formData.depositAmount : undefined,
      courierMethod: formData.courierMethod,
      weddingDate: formData.weddingDate,
      courierDate: formData.courierDate,
      returnDate: formData.type === 'rent' ? formData.returnDate : undefined,
      isDispatched: editingOrder.isDispatched,
      dispatchedDate: editingOrder.dispatchedDate,
      isDepositRefunded: editingOrder.isDepositRefunded,
      depositRefundedDate: editingOrder.depositRefundedDate
    };

    onEditOrder(editingOrder.id, orderData);
    toast({
      title: "Order updated",
      description: "Order has been updated successfully."
    });

    setIsEditOrderDialogOpen(false);
    setEditingOrder(null);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentOrder || paymentAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount.",
        variant: "destructive"
      });
      return;
    }

    const remainingBalance = paymentOrder.totalPrice - paymentOrder.paidAmount;
    if (paymentAmount > remainingBalance) {
      toast({
        title: "Error",
        description: `Payment amount cannot exceed the remaining balance of Rs. ${remainingBalance}.`,
        variant: "destructive"
      });
      return;
    }

    const newPaymentRecord: PaymentRecord = {
      id: `payment_${Date.now()}`,
      amount: paymentAmount,
      date: new Date().toISOString(),
      note: paymentNote || 'Payment'
    };

    const updatedOrder = {
      ...paymentOrder,
      paidAmount: paymentOrder.paidAmount + paymentAmount,
      paymentRecords: [...paymentOrder.paymentRecords, newPaymentRecord]
    };

    const { id, createdAt, ...orderData } = updatedOrder;
    onEditOrder(paymentOrder.id, orderData);

    toast({
      title: "Payment recorded",
      description: `Payment of Rs. ${paymentAmount} has been recorded successfully.`
    });

    setIsPaymentDialogOpen(false);
    setPaymentAmount(0);
    setPaymentNote('');
    setPaymentOrder(null);
  };

  const toggleItemReturn = (itemId: string) => {
    if (!editingOrder) return;
    
    const updatedItems = editingOrder.items.map(item => 
      item.id === itemId ? { ...item, isReturned: !item.isReturned } : item
    );
    
    const updatedOrder = { ...editingOrder, items: updatedItems };
    const { id, createdAt, ...orderData } = updatedOrder;
    onEditOrder(editingOrder.id, orderData);
    setEditingOrder(updatedOrder);
  };

  const getOrderStatusBadge = (order: Order) => {
    if (order.isCancelled) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelled</Badge>;
    }
    if (order.isDispatched) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Dispatched</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/customers')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsInvoiceDialogOpen(true)}
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Customer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the customer "{customer.name}" and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700">
                  Delete Customer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Customer Information
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="text-gray-900">{customer.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Contact Number</p>
            <p className="text-gray-900">{customer.contactNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Customer Since</p>
            <p className="text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {totalSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {totalPaid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Balance Due</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {totalBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order History - Show all orders including cancelled ones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order History
            <Button onClick={handleNewOrder} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">This customer hasn't placed any orders yet.</p>
              <Button onClick={handleNewOrder} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create First Order
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">Order #{order.id.slice(-8)}</h4>
                      {getOrderStatusBadge(order)}
                      <Badge variant={order.type === 'rent' ? 'default' : 'secondary'} className="capitalize">
                        {order.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintBill(order)}
                        className="bg-green-50 hover:bg-green-100"
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Print Bill
                      </Button>
                      {!order.isCancelled && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddPayment(order)}
                            disabled={order.paidAmount >= order.totalPrice}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Add Payment
                          </Button>
                          {!order.isDispatched && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMarkDispatched(order)}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Mark Dispatched
                            </Button>
                          )}
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
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will cancel order #{order.id.slice(-8)}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Cancel Order
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Items:</p>
                      <p className="font-medium">{order.items.map(item => item.name).join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Wedding Date:</p>
                      <p className="font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(order.weddingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Courier Method:</p>
                      <p className="font-medium capitalize">{order.courierMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Order Date:</p>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex space-x-4">
                        <span>Total: <span className="font-medium">Rs. {order.totalPrice}</span></span>
                        <span className="text-green-600">Paid: <span className="font-medium">Rs. {order.paidAmount}</span></span>
                        <span className="text-red-600">Balance: <span className="font-medium">Rs. {order.totalPrice - order.paidAmount}</span></span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <InvoiceDialog
        isOpen={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        customer={customer}
        orders={activeCustomerOrders}
      />

      {billDialogOrder && (
        <BillDialog
          isOpen={!!billDialogOrder}
          onOpenChange={(open) => !open && setBillDialogOrder(null)}
          customer={customer}
          order={billDialogOrder}
        />
      )}

      {/* Edit Order Dialog */}
      <Dialog open={isEditOrderDialogOpen} onOpenChange={setIsEditOrderDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Edit Order
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editingOrder && setBillDialogOrder(editingOrder)}
                  className="bg-green-50 hover:bg-green-100"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print Bill
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editingOrder && handleAddPayment(editingOrder)}
                  disabled={editingOrder ? editingOrder.paidAmount >= editingOrder.totalPrice : true}
                  className="bg-blue-50 hover:bg-blue-100"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Add Payment
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOrderSubmit} className="space-y-4">
            {/* Form fields - similar to Orders page but simplified for editing */}
            <div>
              <Label>Items</Label>
              {editingOrder && (
                <div className="space-y-2">
                  {editingOrder.items.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                      <Checkbox
                        checked={item.isReturned || false}
                        onCheckedChange={() => toggleItemReturn(item.id)}
                        disabled={editingOrder.type === 'sale'}
                      />
                      <span className={`flex-1 ${item.isReturned ? 'line-through text-gray-500' : ''}`}>
                        {item.name} - Rs. {item.price}
                      </span>
                      {item.isReturned && (
                        <Badge variant="outline" className="text-green-600">
                          Returned
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weddingDate">Wedding Date</Label>
                <Input
                  id="weddingDate"
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="courierDate">Courier Date</Label>
                <Input
                  id="courierDate"
                  type="date"
                  value={formData.courierDate}
                  onChange={(e) => setFormData({ ...formData, courierDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {formData.type === 'rent' && (
              <div>
                <Label htmlFor="returnDate">Return Date</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOrderDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Update Order
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          {paymentOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">Order Summary</h4>
                <p className="text-sm text-gray-600">Customer: {paymentOrder.customerName}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-medium">Rs. {paymentOrder.totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid Amount:</span>
                    <span className="font-medium text-green-600">Rs. {paymentOrder.paidAmount}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>Balance:</span>
                    <span className="font-medium text-red-600">Rs. {paymentOrder.totalPrice - paymentOrder.paidAmount}</span>
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
                    max={paymentOrder.totalPrice - paymentOrder.paidAmount}
                    required
                    className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
    </div>
  );
};
