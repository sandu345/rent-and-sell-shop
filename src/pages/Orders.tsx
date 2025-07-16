// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Switch } from '@/components/ui/switch';
// import { Plus, Edit, Calendar, Truck, Package, DollarSign, Table, Grid, Printer, X } from 'lucide-react';
// import { Customer, Order, OrderItem, PaymentRecord } from '@/types/types';
// import { toast } from '@/hooks/use-toast';
// import { OrderTable } from '@/components/OrderTable';
// import { BillDialog } from '@/components/BillDialog';
// import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

// interface OrdersProps {
//   customers: Customer[];
//   orders: Order[];
//   onAddOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
//   onEditOrder: (id: string, order: Omit<Order, 'id' | 'createdAt'>) => void;
//   onCancelOrder: (id: string) => void;
// }

// export const Orders: React.FC<OrdersProps> = ({ customers, orders, onAddOrder, onEditOrder, onCancelOrder }) => {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
//   const [isDispatchConfirmOpen, setIsDispatchConfirmOpen] = useState(false);
//   const [editingOrder, setEditingOrder] = useState<Order | null>(null);
//   const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
//   const [paymentAmount, setPaymentAmount] = useState<number>(0);
//   const [paymentNote, setPaymentNote] = useState('');
//   const [billDialogOrder, setBillDialogOrder] = useState<Order | null>(null);
  
//   const [formData, setFormData] = useState({
//     customerId: '',
//     type: 'rent' as 'rent' | 'sale',
//     items: [{ name: '', price: 0 }],
//     paidAmount: 0,
//     depositAmount: 0,
//     courierMethod: 'pickme' as 'pickme' | 'byhand' | 'bus',
//     weddingDate: '',
//     courierDate: '',
//     returnDate: ''
//   });

//   // Check for order to edit from localStorage (when coming from CustomerProfile)
//   useEffect(() => {
//     const editOrderId = localStorage.getItem('editOrderId');
//     if (editOrderId) {
//       const orderToEdit = orders.find(order => order.id === editOrderId);
//       if (orderToEdit) {
//         handleEdit(orderToEdit);
//         localStorage.removeItem('editOrderId'); // Clean up
//       }
//     }
//   }, [orders]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     const selectedCustomer = customers.find(c => c.id === formData.customerId);
//     if (!selectedCustomer) {
//       toast({
//         title: "Error",
//         description: "Please select a valid customer.",
//         variant: "destructive"
//       });
//       return;
//     }

//     const validItems = formData.items.filter(item => item.name.trim() && item.price > 0);
//     if (validItems.length === 0) {
//       toast({
//         title: "Error",
//         description: "Please add at least one item with name and price.",
//         variant: "destructive"
//       });
//       return;
//     }

//     const totalPrice = validItems.reduce((sum, item) => sum + item.price, 0);
    
//     const initialPaymentRecords: PaymentRecord[] = formData.paidAmount > 0 ? [{
//       id: `payment_${Date.now()}`,
//       amount: formData.paidAmount,
//       date: new Date().toISOString(),
//       note: 'Initial payment'
//     }] : [];
    
//     const orderData = {
//       customerId: formData.customerId,
//       customerName: selectedCustomer.name,
//       type: formData.type,
//       items: validItems.map((item, index) => ({ 
//         ...item, 
//         id: `${Date.now()}_${index}`,
//         isReturned: false
//       })),
//       totalPrice,
//       paidAmount: formData.paidAmount,
//       paymentRecords: initialPaymentRecords,
//       depositAmount: formData.type === 'rent' ? formData.depositAmount : undefined,
//       courierMethod: formData.courierMethod,
//       weddingDate: formData.weddingDate,
//       courierDate: formData.courierDate,
//       returnDate: formData.type === 'rent' ? formData.returnDate : undefined,
//       isDispatched: editingOrder?.isDispatched || false,
//       dispatchedDate: editingOrder?.dispatchedDate,
//       isDepositRefunded: editingOrder?.isDepositRefunded || false,
//       depositRefundedDate: editingOrder?.depositRefundedDate
//     };

//     if (editingOrder) {
//       onEditOrder(editingOrder.id, orderData);
//       toast({
//         title: "Order updated",
//         description: "Order has been updated successfully."
//       });
//     } else {
//       onAddOrder(orderData);
//       toast({
//         title: "Order placed",
//         description: "New order has been placed successfully."
//       });
      
//       // Show bill dialog for new orders
//       const newOrder = { 
//         ...orderData, 
//         id: `order_${Date.now()}`, 
//         createdAt: new Date().toISOString() 
//       };
//       setBillDialogOrder(newOrder as Order);
//     }

//     resetForm();
//     setIsDialogOpen(false);
//   };

//   const handlePayment = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!paymentOrder || paymentAmount <= 0) {
//       toast({
//         title: "Error",
//         description: "Please enter a valid payment amount.",
//         variant: "destructive"
//       });
//       return;
//     }

//     const remainingBalance = paymentOrder.totalPrice - paymentOrder.paidAmount;
//     if (paymentAmount > remainingBalance) {
//       toast({
//         title: "Error",
//         description: `Payment amount cannot exceed the remaining balance of Rs. ${remainingBalance}.`,
//         variant: "destructive"
//       });
//       return;
//     }

//     const newPaymentRecord: PaymentRecord = {
//       id: `payment_${Date.now()}`,
//       amount: paymentAmount,
//       date: new Date().toISOString(),
//       note: paymentNote || 'Payment'
//     };

//     const updatedOrder = {
//       ...paymentOrder,
//       paidAmount: paymentOrder.paidAmount + paymentAmount,
//       paymentRecords: [...paymentOrder.paymentRecords, newPaymentRecord]
//     };

//     const { id, createdAt, ...orderData } = updatedOrder;
//     onEditOrder(paymentOrder.id, orderData);

//     // Update the editing order if it's the same order
//     if (editingOrder && editingOrder.id === paymentOrder.id) {
//       setEditingOrder(updatedOrder);
//     }

//     toast({
//       title: "Payment recorded",
//       description: `Payment of Rs. ${paymentAmount} has been recorded successfully.`
//     });

//     setIsPaymentDialogOpen(false);
//     setPaymentAmount(0);
//     setPaymentNote('');
//     setPaymentOrder(null);
//   };

//   const handleMarkDepositRefunded = () => {
//     if (!editingOrder || editingOrder.type !== 'rent' || !editingOrder.depositAmount) return;

//     const updatedOrder = {
//       ...editingOrder,
//       isDepositRefunded: true,
//       depositRefundedDate: new Date().toISOString()
//     };

//     const { id, createdAt, ...orderData } = updatedOrder;
//     onEditOrder(editingOrder.id, orderData);
//     setEditingOrder(updatedOrder);

//     toast({
//       title: "Deposit marked as refunded",
//       description: `Deposit of Rs. ${editingOrder.depositAmount} has been marked as refunded.`
//     });
//   };

//   const handleMarkDispatched = () => {
//     if (!editingOrder) return;

//     const updatedOrder = {
//       ...editingOrder,
//       isDispatched: true,
//       dispatchedDate: new Date().toISOString()
//     };

//     const { id, createdAt, ...orderData } = updatedOrder;
//     onEditOrder(editingOrder.id, orderData);
//     setEditingOrder(updatedOrder);

//     toast({
//       title: "Order dispatched",
//       description: "Order has been marked as dispatched."
//     });

//     setIsDispatchConfirmOpen(false);
//   };

//   const handleDispatchToggle = (isDispatched: boolean) => {
//     if (!editingOrder) return;

//     const updatedOrder = {
//       ...editingOrder,
//       isDispatched: isDispatched,
//       dispatchedDate: isDispatched ? new Date().toISOString() : undefined
//     };

//     const { id, createdAt, ...orderData } = updatedOrder;
//     onEditOrder(editingOrder.id, orderData);
//     setEditingOrder(updatedOrder);

//     toast({
//       title: isDispatched ? "Order dispatched" : "Order marked as not dispatched",
//       description: isDispatched 
//         ? "Order has been marked as dispatched." 
//         : "Order has been marked as not dispatched."
//     });
//   };

//   const handleRefundToggle = (isRefunded: boolean) => {
//     if (!editingOrder || editingOrder.type !== 'rent' || !editingOrder.depositAmount) return;

//     const updatedOrder = {
//       ...editingOrder,
//       isDepositRefunded: isRefunded,
//       depositRefundedDate: isRefunded ? new Date().toISOString() : undefined
//     };

//     const { id, createdAt, ...orderData } = updatedOrder;
//     onEditOrder(editingOrder.id, orderData);
//     setEditingOrder(updatedOrder);

//     toast({
//       title: isRefunded ? "Deposit marked as refunded" : "Deposit refund removed",
//       description: isRefunded 
//         ? `Deposit of Rs. ${editingOrder.depositAmount} has been marked as refunded.`
//         : "Deposit refund status has been removed."
//     });
//   };

//   const confirmDispatch = () => {
//     setIsDispatchConfirmOpen(true);
//   };

//   const resetForm = () => {
//     setFormData({
//       customerId: '',
//       type: 'rent',
//       items: [{ name: '', price: 0 }],
//       paidAmount: 0,
//       depositAmount: 0,
//       courierMethod: 'pickme',
//       weddingDate: '',
//       courierDate: '',
//       returnDate: ''
//     });
//     setEditingOrder(null);
//   };

//   const handleEdit = (order: Order) => {
//     setEditingOrder(order);
//     setFormData({
//       customerId: order.customerId,
//       type: order.type,
//       items: order.items.map(item => ({ name: item.name, price: item.price })),
//       paidAmount: order.paidAmount,
//       depositAmount: order.depositAmount || 0,
//       courierMethod: order.courierMethod,
//       weddingDate: order.weddingDate,
//       courierDate: order.courierDate,
//       returnDate: order.returnDate || ''
//     });
//     setIsDialogOpen(true);
//   };

//   const handleAddPayment = (order: Order) => {
//     setPaymentOrder(order);
//     setPaymentAmount(0);
//     setPaymentNote('');
//     setIsPaymentDialogOpen(true);
//   };

//   const handleAddNew = () => {
//     resetForm();
//     setIsDialogOpen(true);
//   };

//   const addItem = () => {
//     setFormData({
//       ...formData,
//       items: [...formData.items, { name: '', price: 0 }]
//     });
//   };

//   const removeItem = (index: number) => {
//     if (formData.items.length > 1) {
//       setFormData({
//         ...formData,
//         items: formData.items.filter((_, i) => i !== index)
//       });
//     }
//   };

//   const updateItem = (index: number, field: 'name' | 'price', value: string | number) => {
//     const updatedItems = [...formData.items];
//     updatedItems[index] = { ...updatedItems[index], [field]: value };
//     setFormData({ ...formData, items: updatedItems });
//   };

//   const toggleItemReturn = (itemId: string) => {
//     if (!editingOrder) return;
    
//     const updatedItems = editingOrder.items.map(item => 
//       item.id === itemId ? { ...item, isReturned: !item.isReturned } : item
//     );
    
//     const updatedOrder = { ...editingOrder, items: updatedItems };
//     const { id, createdAt, ...orderData } = updatedOrder;
//     onEditOrder(editingOrder.id, orderData);
//     setEditingOrder(updatedOrder);
//   };

//   const handlePrintBill = () => {
//     if (editingOrder) {
//       setBillDialogOrder(editingOrder);
//     }
//   };

//   const handleAddPaymentFromDialog = () => {
//     if (editingOrder) {
//       setPaymentOrder(editingOrder);
//       setPaymentAmount(0);
//       setPaymentNote('');
//       setIsPaymentDialogOpen(true);
//     }
//   };

//   const removeOrderItem = (itemId: string) => {
//     if (!editingOrder) return;
    
//     const updatedItems = editingOrder.items.filter(item => item.id !== itemId);
//     const totalPrice = updatedItems.reduce((sum, item) => sum + item.price, 0);
    
//     const updatedOrder = { 
//       ...editingOrder, 
//       items: updatedItems,
//       totalPrice 
//     };
    
//     const { id, createdAt, ...orderData } = updatedOrder;
//     onEditOrder(editingOrder.id, orderData);
//     setEditingOrder(updatedOrder);
//   };

//   const addOrderItem = () => {
//     if (!editingOrder) return;
    
//     const newItem: OrderItem = {
//       id: `${Date.now()}_${editingOrder.items.length}`,
//       name: '',
//       price: 0,
//       isReturned: false
//     };
    
//     const updatedItems = [...editingOrder.items, newItem];
//     const updatedOrder = { ...editingOrder, items: updatedItems };
//     setEditingOrder(updatedOrder);
//   };

//   const updateOrderItem = (itemId: string, field: 'name' | 'price', value: string | number) => {
//     if (!editingOrder) return;
    
//     const updatedItems = editingOrder.items.map(item => 
//       item.id === itemId ? { ...item, [field]: value } : item
//     );
    
//     const totalPrice = updatedItems.reduce((sum, item) => sum + item.price, 0);
    
//     const updatedOrder = { 
//       ...editingOrder, 
//       items: updatedItems,
//       totalPrice 
//     };
    
//     const { id, createdAt, ...orderData } = updatedOrder;
//     onEditOrder(editingOrder.id, orderData);
//     setEditingOrder(updatedOrder);
//   };

//   const updateDepositAmount = (amount: number) => {
//     if (!editingOrder) return;
    
//     const updatedOrder = { ...editingOrder, depositAmount: amount };
//     const { id, createdAt, ...orderData } = updatedOrder;
//     onEditOrder(editingOrder.id, orderData);
//     setEditingOrder(updatedOrder);
//   };

//   const updateCourierMethod = (method: 'pickme' | 'byhand' | 'bus') => {
//     if (!editingOrder) return;
    
//     const updatedOrder = { ...editingOrder, courierMethod: method };
//     const { id, createdAt, ...orderData } = updatedOrder;
//     onEditOrder(editingOrder.id, orderData);
//     setEditingOrder(updatedOrder);
//   };

//   const updateDate = (field: 'weddingDate' | 'courierDate' | 'returnDate', value: string) => {
//     if (!editingOrder) return;
    
//     const updatedOrder = { ...editingOrder, [field]: value };
//     const { id, createdAt, ...orderData } = updatedOrder;
//     onEditOrder(editingOrder.id, orderData);
//     setEditingOrder(updatedOrder);
//   };

//   const handleCancelOrderFromDialog = () => {
//     if (!editingOrder) return;
    
//     onCancelOrder(editingOrder.id);
//     setIsDialogOpen(false);
//     toast({
//       title: "Order cancelled",
//       description: "Order has been cancelled successfully."
//     });
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
//         <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
//           <Plus className="h-4 w-4 mr-2" />
//           New Order
//         </Button>
//       </div>

//       <OrderTable orders={orders} onEditOrder={handleEdit} />

//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center justify-between">
//               {editingOrder ? 'Edit Order' : 'Create New Order'}
//               {editingOrder && (
//                 <div className="flex items-center space-x-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={handlePrintBill}
//                     className="bg-green-50 hover:bg-green-100"
//                   >
//                     <Printer className="h-4 w-4 mr-1" />
//                     Print Bill
//                   </Button>
//                   {!editingOrder.isCancelled && (
//                     <AlertDialog>
//                       <AlertDialogTrigger asChild>
//                         <Button variant="destructive" size="sm">
//                           Cancel Order
//                         </Button>
//                       </AlertDialogTrigger>
//                       <AlertDialogContent>
//                         <AlertDialogHeader>
//                           <AlertDialogTitle>Cancel Order</AlertDialogTitle>
//                           <AlertDialogDescription>
//                             Are you sure you want to cancel this order? This action cannot be undone.
//                           </AlertDialogDescription>
//                         </AlertDialogHeader>
//                         <AlertDialogFooter>
//                           <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
//                           <AlertDialogAction 
//                             onClick={handleCancelOrderFromDialog}
//                             className="bg-red-600 hover:bg-red-700"
//                           >
//                             Yes, Cancel Order
//                           </AlertDialogAction>
//                         </AlertDialogFooter>
//                       </AlertDialogContent>
//                     </AlertDialog>
//                   )}
//                 </div>
//               )}
//             </DialogTitle>
//           </DialogHeader>
          
//           {editingOrder ? (
//             <div className="space-y-6">
//               {/* Fixed Fields */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <Label>Customer Name</Label>
//                   <Input value={editingOrder.customerName} disabled className="bg-gray-100" />
//                 </div>
//                 <div>
//                   <Label>Order Type</Label>
//                   <Input value={editingOrder.type} disabled className="bg-gray-100 capitalize" />
//                 </div>
//               </div>

//               {/* Items Section */}
//               <div>
//                 <div className="flex items-center justify-between mb-2">
//                   <Label>Items</Label>
//                   <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
//                     <Plus className="h-4 w-4 mr-1" />
//                     Add Item
//                   </Button>
//                 </div>
//                 <div className="space-y-2">
//                   {editingOrder.items.map((item, index) => (
//                     <div key={item.id} className="flex items-center gap-2 p-3 border rounded-lg">
//                       <Checkbox
//                         checked={item.isReturned || false}
//                         onCheckedChange={() => toggleItemReturn(item.id)}
//                         disabled={editingOrder.type === 'sale'}
//                       />
//                       <Input
//                         placeholder="Item name"
//                         value={item.name}
//                         onChange={(e) => updateOrderItem(item.id, 'name', e.target.value)}
//                         className="flex-1"
//                       />
//                       <Input
//                         type="number"
//                         placeholder="Price"
//                         value={item.price || ''}
//                         onChange={(e) => updateOrderItem(item.id, 'price', parseFloat(e.target.value) || 0)}
//                         className="w-24"
//                       />
//                       {editingOrder.items.length > 1 && (
//                         <Button 
//                           type="button" 
//                           variant="outline" 
//                           size="sm"
//                           onClick={() => removeOrderItem(item.id)}
//                         >
//                           <X className="h-4 w-4" />
//                         </Button>
//                       )}
//                       {item.isReturned && (
//                         <Badge variant="outline" className="text-green-600">
//                           Returned
//                         </Badge>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Financial Summary */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
//                 <div>
//                   <Label>Total Price</Label>
//                   <Input value={`Rs. ${editingOrder.totalPrice}`} disabled className="bg-gray-100" />
//                 </div>
//                 <div>
//                   <Label>Paid Amount</Label>
//                   <Input value={`Rs. ${editingOrder.paidAmount}`} disabled className="bg-gray-100" />
//                 </div>
//                 <div>
//                   <Label>Balance</Label>
//                   <Input 
//                     value={`Rs. ${editingOrder.totalPrice - editingOrder.paidAmount}`} 
//                     disabled 
//                     className="bg-gray-100" 
//                   />
//                 </div>
//               </div>

//               {/* Initial Payment */}
//               <div>
//                 <Label>Initial Payment Amount</Label>
//                 <div className="flex gap-2">
//                   <Input 
//                     value={`Rs. ${editingOrder.paymentRecords.find(p => p.note === 'Initial payment')?.amount || 0}`}
//                     disabled 
//                     className="bg-gray-100" 
//                   />
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={handleAddPaymentFromDialog}
//                     disabled={editingOrder.paidAmount >= editingOrder.totalPrice}
//                     className="bg-blue-50 hover:bg-blue-100"
//                   >
//                     <DollarSign className="h-4 w-4 mr-1" />
//                     Update Payment
//                   </Button>
//                 </div>
//               </div>

//               {/* Deposit Amount */}
//               {editingOrder.type === 'rent' && (
//                 <div>
//                   <Label>Deposit Amount</Label>
//                   <div className="flex gap-2">
//                     <Input
//                       type="number"
//                       value={editingOrder.depositAmount || ''}
//                       onChange={(e) => updateDepositAmount(parseFloat(e.target.value) || 0)}
//                       className="flex-1"
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Status Switches */}
//               <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
//                 <Label className="text-base font-medium">Order Status</Label>
                
//                 {/* Mark as Dispatched Switch */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     <Package className="h-4 w-4" />
//                     <Label>Mark as Dispatched</Label>
//                   </div>
//                   <Switch
//                     checked={editingOrder.isDispatched || false}
//                     onCheckedChange={handleDispatchToggle}
//                   />
//                 </div>

//                 {/* Mark as Refunded Switch - Only for rental orders with deposit */}
//                 {editingOrder.type === 'rent' && editingOrder.depositAmount && (
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <DollarSign className="h-4 w-4" />
//                       <Label>Mark Deposit as Refunded</Label>
//                     </div>
//                     <Switch
//                       checked={editingOrder.isDepositRefunded || false}
//                       onCheckedChange={handleRefundToggle}
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Courier Method */}
//               <div>
//                 <Label>Courier Method</Label>
//                 <Select 
//                   value={editingOrder.courierMethod} 
//                   onValueChange={(value: 'pickme' | 'byhand' | 'bus') => updateCourierMethod(value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="pickme">PickMe</SelectItem>
//                     <SelectItem value="byhand">By Hand</SelectItem>
//                     <SelectItem value="bus">Bus</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Dates */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 <div>
//                   <Label>Wedding Date</Label>
//                   <Input
//                     type="date"
//                     value={editingOrder.weddingDate}
//                     onChange={(e) => updateDate('weddingDate', e.target.value)}
//                   />
//                 </div>
//                 <div>
//                   <Label>Courier Date</Label>
//                   <Input
//                     type="date"
//                     value={editingOrder.courierDate}
//                     onChange={(e) => updateDate('courierDate', e.target.value)}
//                   />
//                 </div>
//                 {editingOrder.type === 'rent' && (
//                   <div>
//                     <Label>Return Date</Label>
//                     <Input
//                       type="date"
//                       value={editingOrder.returnDate || ''}
//                       onChange={(e) => updateDate('returnDate', e.target.value)}
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex space-x-2 justify-end">
//                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button 
//                   type="button" 
//                   className="bg-blue-600 hover:bg-blue-700"
//                   onClick={() => setIsDialogOpen(false)}
//                 >
//                   Done
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <Label htmlFor="customer">Customer</Label>
//                 <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a customer" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {customers.map((customer) => (
//                       <SelectItem key={customer.id} value={customer.id}>
//                         {customer.name} - {customer.contactNumber}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label>Order Type</Label>
//                 <Select value={formData.type} onValueChange={(value: 'rent' | 'sale') => setFormData({ ...formData, type: value })}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="rent">Rental</SelectItem>
//                     <SelectItem value="sale">Sale</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label>Items</Label>
//                 {formData.items.map((item, index) => (
//                   <div key={index} className="flex gap-2 mb-2">
//                     <Input
//                       placeholder="Item name"
//                       value={item.name}
//                       onChange={(e) => updateItem(index, 'name', e.target.value)}
//                       className="flex-1"
//                     />
//                     <Input
//                       type="number"
//                       placeholder="Price"
//                       value={item.price || ''}
//                       onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
//                       className="w-24"
//                     />
//                     {formData.items.length > 1 && (
//                       <Button type="button" variant="outline" onClick={() => removeItem(index)}>
//                         Remove
//                       </Button>
//                     )}
//                   </div>
//                 ))}
//                 <Button type="button" variant="outline" onClick={addItem} className="mt-2">
//                   Add Item
//                 </Button>
//               </div>

//               <div>
//                 <Label htmlFor="paidAmount">Initial Payment Amount (Rs.)</Label>
//                 <Input
//                   id="paidAmount"
//                   type="number"
//                   value={formData.paidAmount || ''}
//                   onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
//                   placeholder="Enter initial payment amount"
//                   className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                 />
//               </div>

//               {formData.type === 'rent' && (
//                 <div>
//                   <Label htmlFor="deposit">Deposit Amount (Rs.)</Label>
//                   <Input
//                     id="deposit"
//                     type="number"
//                     value={formData.depositAmount || ''}
//                     onChange={(e) => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) || 0 })}
//                     className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                   />
//                 </div>
//               )}

//               <div>
//                 <Label>Courier Method</Label>
//                 <Select value={formData.courierMethod} onValueChange={(value: 'pickme' | 'byhand' | 'bus') => setFormData({ ...formData, courierMethod: value })}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="pickme">PickMe</SelectItem>
//                     <SelectItem value="byhand">By Hand</SelectItem>
//                     <SelectItem value="bus">Bus</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="weddingDate">Wedding Date</Label>
//                   <Input
//                     id="weddingDate"
//                     type="date"
//                     value={formData.weddingDate}
//                     onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="courierDate">Courier Date</Label>
//                   <Input
//                     id="courierDate"
//                     type="date"
//                     value={formData.courierDate}
//                     onChange={(e) => setFormData({ ...formData, courierDate: e.target.value })}
//                     required
//                   />
//                 </div>
//               </div>

//               {formData.type === 'rent' && (
//                 <div>
//                   <Label htmlFor="returnDate">Return Date</Label>
//                   <Input
//                     id="returnDate"
//                     type="date"
//                     value={formData.returnDate}
//                     onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
//                     required
//                   />
//                 </div>
//               )}

//               <div className="flex justify-end space-x-2 pt-4">
//                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
//                   Create Order
//                 </Button>
//               </div>
//             </form>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Dispatch Confirmation Dialog */}
//       <Dialog open={isDispatchConfirmOpen} onOpenChange={setIsDispatchConfirmOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Dispatch</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <p>Are you sure you want to mark this order as dispatched?</p>
//             <div className="flex justify-end space-x-2">
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={() => setIsDispatchConfirmOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 type="button" 
//                 onClick={handleMarkDispatched}
//                 className="bg-orange-600 hover:bg-orange-700"
//               >
//                 Yes, Mark as Dispatched
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Add Payment</DialogTitle>
//           </DialogHeader>
//           {paymentOrder && (
//             <div className="space-y-4">
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <h4 className="font-medium">Order Summary</h4>
//                 <p className="text-sm text-gray-600">Customer: {paymentOrder.customerName}</p>
//                 <div className="mt-2 space-y-1 text-sm">
//                   <div className="flex justify-between">
//                     <span>Total Amount:</span>
//                     <span className="font-medium">Rs. {paymentOrder.totalPrice}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Paid Amount:</span>
//                     <span className="font-medium text-green-600">Rs. {paymentOrder.paidAmount}</span>
//                   </div>
//                   <div className="flex justify-between border-t pt-1">
//                     <span>Balance:</span>
//                     <span className="font-medium text-red-600">Rs. {paymentOrder.totalPrice - paymentOrder.paidAmount}</span>
//                   </div>
//                 </div>
//               </div>
              
//               <form onSubmit={handlePayment} className="space-y-4">
//                 <div>
//                   <Label htmlFor="paymentAmount">Payment Amount (Rs.)</Label>
//                   <Input
//                     id="paymentAmount"
//                     type="number"
//                     value={paymentAmount || ''}
//                     onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
//                     placeholder="Enter payment amount"
//                     max={paymentOrder.totalPrice - paymentOrder.paidAmount}
//                     required
//                     className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="paymentNote">Note (Optional)</Label>
//                   <Input
//                     id="paymentNote"
//                     value={paymentNote}
//                     onChange={(e) => setPaymentNote(e.target.value)}
//                     placeholder="Payment note"
//                   />
//                 </div>

//                 <div className="flex justify-end space-x-2">
//                   <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit" className="bg-green-600 hover:bg-green-700">
//                     Record Payment
//                   </Button>
//                 </div>
//               </form>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {billDialogOrder && (
//         <BillDialog
//           isOpen={!!billDialogOrder}
//           onOpenChange={(open) => !open && setBillDialogOrder(null)}
//           customer={customers.find(c => c.id === billDialogOrder.customerId)!}
//           order={billDialogOrder}
//         />
//       )}
//     </div>
//   );
// };



// pages/Orders.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Plus, Edit, Calendar, Truck, Package, DollarSign, Printer, X, ChevronLeft, ChevronRight, Loader2, Filter } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Customer, useCustomerSearch } from '@/hooks/useCustomers';
import { Order, OrderItem } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { OrderTable } from '@/components/OrderTable';
import { BillDialog } from '@/components/BillDialog';
import { OrderType } from '@/types/types';

export const Orders: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNote, setPaymentNote] = useState('');
  const [billDialogOrder, setBillDialogOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  type FormItem = { name: string; price: number; _id?: string };
  const [formData, setFormData] = useState<{
    customerId: string;
    orderType: 'rent' | 'sale';
    items: FormItem[];
    paidAmount: number;
    depositAmount: number;
    paymentMethod: 'pickme' | 'byhand' | 'bus';
    weddingDate: string;
    courierDate: string;
    returnDate: string;
  }>({
    customerId: '',
    orderType: 'rent',
    items: [{ name: '', price: 0 }],
    paidAmount: 0,
    depositAmount: 0,
    paymentMethod: 'pickme',
    weddingDate: '',
    courierDate: '',
    returnDate: ''
  });

  const {
    orders,
    loading,
    error,
    totalPages,
    currentPage,
    filters,
    setFilters,
    addOrder,
    updateOrder,
    addPayment,
    markDispatched,
    markItemReturned,
    cancelOrder,
    goToPage,
    total
  } = useOrders(1, 12);

  const { customers, searchCustomers } = useCustomerSearch();

  // Load customers for dropdown
  useEffect(() => {
    searchCustomers('');
  }, []);

  const adaptCustomerForBill = (apiCustomer: Customer): Customer => ({
  _id: apiCustomer._id,
  name: apiCustomer.name,
  address: apiCustomer.address,
  contactNumber: apiCustomer.contactNumber,
  createdAt: apiCustomer.createdAt
});

const adaptOrderForBill = (apiOrder: Order): OrderType => ({
  _id: apiOrder._id,
  customer: apiOrder.customer,
  customerName: apiOrder.customerName,
  type: apiOrder.orderType,
  items: apiOrder.items.map(item => ({
    _id: item._id,
    name: item.name,
    price: item.price,
    isReturned: item.isReturned,
    returnedAt: item.returnedAt ? new Date(item.returnedAt).toISOString() : undefined
  })),
  totalAmount: apiOrder.totalAmount,
  paidAmount: apiOrder.paidAmount,
  // paymentRecords: [], // You'll need to handle this based on your payment structure
  depositAmount: apiOrder.depositAmount,
  courierMethod: apiOrder.paymentMethod, // Note: this might need adjustment
  weddingDate: apiOrder.weddingDate,
  courierDate: apiOrder.courierDate,
  returnDate: apiOrder.returnDate,
  isDispatched: apiOrder.isDispatched,
  dispatchedDate: apiOrder.dispatchedDate,
  isDepositRefunded: apiOrder.isDepositRefunded,
  depositRefundedDate: apiOrder.depositRefundedDate,
  createdAt: apiOrder.createdAt,
  isCancelled: apiOrder.isCancelled || false,
  toBePaidAmount: 0,
  isCompleted: false
});
  // Check for order to edit from localStorage (when coming from CustomerProfile)
  useEffect(() => {
    const editOrderId = localStorage.getItem('editOrderId');
    if (editOrderId && orders.length > 0) {
      const orderToEdit = orders.find(order => order._id === editOrderId);
      if (orderToEdit) {
        handleEdit(orderToEdit);
        localStorage.removeItem('editOrderId');
      }
    }
  }, [orders]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setSubmitting(true);
    
  //   try {
  //     const selectedCustomer = customers.find(c => c._id === formData.customerId);
  //     if (!selectedCustomer) {
  //       toast({
  //         title: "Error",
  //         description: "Please select a valid customer.",
  //         variant: "destructive"
  //       });
  //       return;
  //     }

  //     const validItems = formData.items.filter(item => item.name.trim() && item.price > 0);
  //     if (validItems.length === 0) {
  //       toast({
  //         title: "Error",
  //         description: "Please add at least one item with name and price.",
  //         variant: "destructive"
  //       });
  //       return;
  //     }

  //     const totalAmount = validItems.reduce((sum, item) => sum + item.price, 0);
      
  //     // Define a type for creating a new order (without _id, createdAt, etc.)
  //     type CreateOrderInput = Omit<Order, '_id' | 'createdAt' | 'dispatchedDate' | 'isCancelled'>;

  //     const orderData: CreateOrderInput = {
  //       customer: formData.customerId,
  //       customerName: selectedCustomer.name,
  //       orderType: formData.orderType,
  //       items: validItems.map((item, idx) => ({
  //         ...item,
  //         _id: `temp_${Date.now()}_${idx}`,
  //         isReturned: false
  //       })),
  //       totalAmount,
  //       paidAmount: formData.paidAmount,
  //       toBePaidAmount: totalAmount - formData.paidAmount,
  //       depositAmount: formData.orderType === 'rent' ? formData.depositAmount : undefined,
  //       paymentMethod: formData.paymentMethod,
  //       weddingDate: formData.weddingDate,
  //       courierDate: formData.courierDate,
  //       returnDate: formData.orderType === 'rent' ? formData.returnDate : undefined,
  //       isDispatched: editingOrder?.isDispatched || false,
  //       isCompleted: editingOrder?.isCompleted || false,
  //       isDepositRefunded: editingOrder?.isDepositRefunded || false,
  //     };

  //     if (editingOrder) {
  //       await updateOrder(editingOrder._id, orderData);
  //     } else {
  //       await addOrder(orderData as any); // Cast to any if needed, or update addOrder type
  //       // Optionally, you can fetch the latest order and show the bill dialog if needed
  //       // setBillDialogOrder(newOrder);
  //     }

  //     resetForm();
  //     setIsDialogOpen(false);
  //   } catch (err) {
  //     // Error handling is done in the hook
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };




  // In your Orders.tsx, update the handleSubmit function:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    const selectedCustomer = customers.find(c => c._id === formData.customerId);
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

    const totalAmount = validItems.reduce((sum, item) => sum + item.price, 0);
    
    const orderData = {
      customer: formData.customerId,
      customerName: selectedCustomer.name,
      type: formData.orderType, // Use 'orderType' as required by Order type
      items: validItems.map(item => ({
        name: item.name,
        price: item.price,
      })),
      totalAmount,
      paidAmount: formData.paidAmount,
      toBePaidAmount: totalAmount - formData.paidAmount,
      depositAmount: formData.orderType === 'rent' ? formData.depositAmount : undefined,
      courierMethod: formData.paymentMethod, // Use 'paymentMethod' as required by Order type
      weddingDate: formData.weddingDate,
      courierDate: formData.courierDate,
      returnDate: formData.orderType === 'rent' ? formData.returnDate : undefined,
      isDispatched: editingOrder?.isDispatched || false,
      isCompleted: editingOrder?.isCompleted || false,
      isDepositRefunded: editingOrder?.isDepositRefunded || false,
      createdAt: new Date().toISOString(), // Add required field
      // _id: '', // Temporary, backend should replace this
      isCancelled: false, // Add default value if required
    };

    if (editingOrder) {
      // For updates, handle items differently
      const updatedOrderData = {
        ...orderData,
        items: validItems.map(item => ({
          name: item.name,
          price: item.price,
          ...(item._id && !item._id.startsWith('temp_') && { _id: item._id })
        }))
      };
      await updateOrder(editingOrder._id, updatedOrderData);
    } else {
      await addOrder(orderData as OrderType);
    }

    resetForm();
    setIsDialogOpen(false);
  } catch (err) {
    // Error handling is done in the hook
  } finally {
    setSubmitting(false);
  }
};


  const handlePayment = async (e: React.FormEvent) => {
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

    try {
      await addPayment(paymentOrder._id, paymentAmount);
      setIsPaymentDialogOpen(false);
      setPaymentAmount(0);
      setPaymentNote('');
      setPaymentOrder(null);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleMarkDispatched = async (orderId: string) => {
    try {
      await markDispatched(orderId);
      if (editingOrder && editingOrder._id === orderId) {
        setEditingOrder({ ...editingOrder, isDispatched: true });
      }
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleDispatchToggle = async (isDispatched: boolean) => {
    if (!editingOrder) return;

    try {
      const updatedOrder = {
        ...editingOrder,
        isDispatched: isDispatched,
        dispatchedDate: isDispatched ? new Date().toISOString() : undefined
      };

      await updateOrder(editingOrder._id, updatedOrder);
      setEditingOrder(updatedOrder);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleRefundToggle = async (isRefunded: boolean) => {
    if (!editingOrder || editingOrder.orderType !== 'rent' || !editingOrder.depositAmount) return;

    try {
      const updatedOrder = {
        ...editingOrder,
        isDepositRefunded: isRefunded,
        depositRefundedDate: isRefunded ? new Date().toISOString() : undefined
      };

      await updateOrder(editingOrder._id, updatedOrder);
      setEditingOrder(updatedOrder);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      orderType: 'rent',
      items: [{ name: '', price: 0 }],
      paidAmount: 0,
      depositAmount: 0,
      paymentMethod: 'pickme',
      weddingDate: '',
      courierDate: '',
      returnDate: ''
    });
    setEditingOrder(null);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customer,
      orderType: order.orderType,
      items: order.items.map(item => ({ name: item.name, price: item.price })),
      paidAmount: order.paidAmount,
      depositAmount: order.depositAmount || 0,
      paymentMethod: order.paymentMethod,
      weddingDate: order.weddingDate,
      courierDate: order.courierDate,
      returnDate: order.returnDate || ''
    });
    setIsDialogOpen(true);
  };

  const handleAddPayment = (order: Order) => {
    setPaymentOrder(order);
    setPaymentAmount(0);
    setPaymentNote('');
    setIsPaymentDialogOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const updateItem = (index: number, field: 'name' | 'price', value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, items: updatedItems });
  };

  const toggleItemReturn = async (itemId: string, itemIndex: number) => {
    if (!editingOrder) return;
    
    try {
      await markItemReturned(editingOrder._id, itemIndex);
      
      const updatedItems = editingOrder.items.map(item => 
        item._id === itemId ? { ...item, isReturned: !item.isReturned } : item
      );
      
      setEditingOrder({ ...editingOrder, items: updatedItems });
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handlePrintBill = () => {
    if (editingOrder) {
      setBillDialogOrder(editingOrder);
    }
  };

  const handleAddPaymentFromDialog = () => {
    if (editingOrder) {
      setPaymentOrder(editingOrder);
      setPaymentAmount(0);
      setPaymentNote('');
      setIsPaymentDialogOpen(true);
    }
  };

  const removeOrderItem = async (itemId: string) => {
    if (!editingOrder) return;
    
    try {
      const updatedItems = editingOrder.items.filter(item => item._id !== itemId);
      const totalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);
      
      const updatedOrder = { 
        ...editingOrder, 
        items: updatedItems,
        totalAmount,
        toBePaidAmount: totalAmount - editingOrder.paidAmount
      };
      
      await updateOrder(editingOrder._id, updatedOrder);
      setEditingOrder(updatedOrder);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const addOrderItem = () => {
    if (!editingOrder) return;
    
    const newItem: OrderItem = {
      _id: `temp_${Date.now()}`,
      name: '',
      price: 0,
      isReturned: false
    };
    
    const updatedItems = [...editingOrder.items, newItem];
    setEditingOrder({ ...editingOrder, items: updatedItems });
  };

  const updateOrderItem = async (itemId: string, field: 'name' | 'price', value: string | number) => {
    if (!editingOrder) return;
    
    const updatedItems = editingOrder.items.map(item => 
      item._id === itemId ? { ...item, [field]: value } : item
    );
    
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);
    
    const updatedOrder = { 
      ...editingOrder, 
      items: updatedItems,
      totalAmount,
      toBePaidAmount: totalAmount - editingOrder.paidAmount
    };
    
    try {
      await updateOrder(editingOrder._id, updatedOrder);
      setEditingOrder(updatedOrder);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const updateDepositAmount = async (amount: number) => {
    if (!editingOrder) return;
    
    try {
      const updatedOrder = { ...editingOrder, depositAmount: amount };
      await updateOrder(editingOrder._id, updatedOrder);
      setEditingOrder(updatedOrder);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const updatePaymentMethod = async (method: 'pickme' | 'byhand' | 'bus') => {
    if (!editingOrder) return;
    
    try {
      const updatedOrder = { ...editingOrder, paymentMethod: method };
      await updateOrder(editingOrder._id, updatedOrder);
      setEditingOrder(updatedOrder);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const updateDate = async (field: 'weddingDate' | 'courierDate' | 'returnDate', value: string) => {
    if (!editingOrder) return;
    
    try {
      const updatedOrder = { ...editingOrder, [field]: value };
      await updateOrder(editingOrder._id, updatedOrder);
      setEditingOrder(updatedOrder);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleCancelOrderFromDialog = async () => {
    if (!editingOrder) return;
    
    try {
      await cancelOrder(editingOrder._id);
      setIsDialogOpen(false);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages} • {total} orders
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsFilterOpen(true)}
            className="bg-gray-50 hover:bg-gray-100"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading orders...</span>
        </div>
      ) : (
        <>
          <OrderTable 
            orders={orders} 
            onEditOrder={handleEdit}
            onAddPayment={handleAddPayment}
            onMarkDispatched={handleMarkDispatched}
            onCancelOrder={cancelOrder}
          />

          {orders.length === 0 && !loading && (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first order.
                </p>
                <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </CardContent>
            </Card>
          )}

          {renderPagination()}
        </>
      )}

      {/* Main Order Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {editingOrder ? 'Edit Order' : 'Create New Order'}
              {editingOrder && (
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePrintBill}
                    className="bg-green-50 hover:bg-green-100"
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    Print Bill
                  </Button>
                  {!editingOrder.isCancelled && (
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
                            onClick={handleCancelOrderFromDialog}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Yes, Cancel Order
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {editingOrder ? (
            <div className="space-y-6">
              {/* Fixed Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name</Label>
                  <Input value={editingOrder.customerName} disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>Order Type</Label>
                  <Input value={editingOrder.orderType} disabled className="bg-gray-100 capitalize" />
                </div>
              </div>

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingOrder.items.map((item, index) => (
                    <div key={item._id} className="flex items-center gap-2 p-3 border rounded-lg">
                      <Checkbox
                        checked={item.isReturned || false}
                        onCheckedChange={() => toggleItemReturn(item._id, index)}
                        disabled={editingOrder.orderType === 'sale'}
                      />
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateOrderItem(item._id, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.price || ''}
                        onChange={(e) => updateOrderItem(item._id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                      {editingOrder.items.length > 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeOrderItem(item._id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {item.isReturned && (
                        <Badge variant="outline" className="text-green-600">
                          Returned
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Total Price</Label>
                  <Input value={`Rs. ${editingOrder.totalAmount}`} disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>Paid Amount</Label>
                  <Input value={`Rs. ${editingOrder.paidAmount}`} disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>Balance</Label>
                  <Input 
                    value={`Rs. ${editingOrder.totalAmount - editingOrder.paidAmount}`} 
                    disabled 
                    className="bg-gray-100" 
                  />
                </div>
              </div>

              {/* Payment Section */}
              <div>
                <Label>Payment</Label>
                <div className="flex gap-2">
                  <Input 
                    value={`Rs. ${editingOrder.paidAmount} paid`}
                    disabled 
                    className="bg-gray-100" 
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPaymentFromDialog}
                    disabled={editingOrder.paidAmount >= editingOrder.totalAmount}
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Add Payment
                  </Button>
                </div>
              </div>

              {/* Deposit Amount */}
              {editingOrder.orderType === 'rent' && (
                <div>
                  <Label>Deposit Amount</Label>
                  <Input
                    type="number"
                    value={editingOrder.depositAmount || ''}
                    onChange={(e) => updateDepositAmount(parseFloat(e.target.value) || 0)}
                    className="flex-1"
                  />
                </div>
              )}

              {/* Status Switches */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <Label className="text-base font-medium">Order Status</Label>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <Label>Mark as Dispatched</Label>
                  </div>
                  <Switch
                    checked={editingOrder.isDispatched || false}
                    onCheckedChange={handleDispatchToggle}
                  />
                </div>

                {editingOrder.orderType === 'rent' && editingOrder.depositAmount && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <Label>Mark Deposit as Refunded</Label>
                    </div>
                    <Switch
                      checked={editingOrder.isDepositRefunded || false}
                      onCheckedChange={handleRefundToggle}
                    />
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <Label>Payment Method</Label>
                <Select 
                  value={editingOrder.paymentMethod} 
                  onValueChange={(value: 'pickme' | 'byhand' | 'bus') => updatePaymentMethod(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickme">PickMe</SelectItem>
                    <SelectItem value="byhand">By Hand</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Wedding Date</Label>
                  <Input
                    type="date"
                    value={editingOrder.weddingDate}
                    onChange={(e) => updateDate('weddingDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Courier Date</Label>
                  <Input
                    type="date"
                    value={editingOrder.courierDate}
                    onChange={(e) => updateDate('courierDate', e.target.value)}
                  />
                </div>
                {editingOrder.orderType === 'rent' && (
                  <div>
                    <Label>Return Date</Label>
                    <Input
                      type="date"
                      value={editingOrder.returnDate || ''}
                      onChange={(e) => updateDate('returnDate', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name} - {customer.contactNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Order Type</Label>
                <Select 
                  value={formData.orderType} 
                  onValueChange={(value: 'rent' | 'sale') => setFormData({ ...formData, orderType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rental</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Items</Label>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price || ''}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                    {formData.items.length > 1 && (
                      <Button type="button" variant="outline" onClick={() => removeItem(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div>
                <Label htmlFor="paidAmount">Initial Payment Amount (Rs.)</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  value={formData.paidAmount || ''}
                  onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter initial payment amount"
                />
              </div>

              {formData.orderType === 'rent' && (
                <div>
                  <Label htmlFor="deposit">Deposit Amount (Rs.)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={formData.depositAmount || ''}
                    onChange={(e) => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div>
                <Label>Payment Method</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value: 'pickme' | 'byhand' | 'bus') => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickme">PickMe</SelectItem>
                    <SelectItem value="byhand">By Hand</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                  </SelectContent>
                </Select>
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

              {formData.orderType === 'rent' && (
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Order'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
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

      {/* Bill Dialog */}
// Then update the Bill Dialog usage:
{billDialogOrder && (
  <BillDialog
    isOpen={!!billDialogOrder}
    onOpenChange={(open) => !open && setBillDialogOrder(null)}
    customer={adaptCustomerForBill(customers.find(c => c._id === billDialogOrder.customer)!)}
    order={adaptOrderForBill(billDialogOrder)}
  />
)}
    </div>
  );
};