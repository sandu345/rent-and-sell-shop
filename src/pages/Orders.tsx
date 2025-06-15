
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Calendar, Truck, Package } from 'lucide-react';
import { Customer, Order, OrderItem } from '@/types/types';
import { toast } from '@/hooks/use-toast';
import { OrderList } from '@/components/OrderList';

interface OrdersProps {
  customers: Customer[];
  orders: Order[];
  onAddOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  onEditOrder: (id: string, order: Omit<Order, 'id' | 'createdAt'>) => void;
}

export const Orders: React.FC<OrdersProps> = ({ customers, orders, onAddOrder, onEditOrder }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'rent' | 'sale'>('all');
  
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'rent' as 'rent' | 'sale',
    items: [{ name: '', price: 0 }] as OrderItem[],
    depositAmount: 0,
    courierMethod: 'pickme' as 'pickme' | 'byhand' | 'bus',
    weddingDate: '',
    courierDate: '',
    returnDate: ''
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || order.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      items: validItems.map((item, index) => ({ ...item, id: `${Date.now()}_${index}` })),
      totalPrice,
      depositAmount: formData.type === 'rent' ? formData.depositAmount : undefined,
      courierMethod: formData.courierMethod,
      weddingDate: formData.weddingDate,
      courierDate: formData.courierDate,
      returnDate: formData.type === 'rent' ? formData.returnDate : undefined
    };

    if (editingOrder) {
      onEditOrder(editingOrder.id, orderData);
      toast({
        title: "Order updated",
        description: "Order has been updated successfully."
      });
    } else {
      onAddOrder(orderData);
      toast({
        title: "Order placed",
        description: "New order has been placed successfully."
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      type: 'rent',
      items: [{ name: '', price: 0 }],
      depositAmount: 0,
      courierMethod: 'pickme',
      weddingDate: '',
      courierDate: '',
      returnDate: ''
    });
    setEditingOrder(null);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      type: order.type,
      items: order.items.map(item => ({ name: item.name, price: item.price })),
      depositAmount: order.depositAmount || 0,
      courierMethod: order.courierMethod,
      weddingDate: order.weddingDate,
      courierDate: order.courierDate,
      returnDate: order.returnDate || ''
    });
    setIsDialogOpen(true);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search orders by customer name or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={(value: 'all' | 'rent' | 'sale') => setFilterType(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="rent">Rentals</SelectItem>
            <SelectItem value="sale">Sales</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <OrderList orders={filteredOrders} onEdit={handleEdit} />

      {filteredOrders.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all' ? 'No orders match your search criteria.' : 'Get started by creating your first order.'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? 'Edit Order' : 'Create New Order'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.contactNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Order Type</Label>
              <Select value={formData.type} onValueChange={(value: 'rent' | 'sale') => setFormData({ ...formData, type: value })}>
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
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem} className="mt-2">
                Add Item
              </Button>
            </div>

            {formData.type === 'rent' && (
              <div>
                <Label htmlFor="deposit">Deposit Amount</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={formData.depositAmount || ''}
                  onChange={(e) => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}

            <div>
              <Label>Courier Method</Label>
              <Select value={formData.courierMethod} onValueChange={(value: 'pickme' | 'byhand' | 'bus') => setFormData({ ...formData, courierMethod: value })}>
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
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingOrder ? 'Update' : 'Create'} Order
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
