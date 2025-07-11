
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Order, OrderItem } from '@/types/types';
import { CalendarDays, Package, DollarSign } from 'lucide-react';

interface EditOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (orderId: string, orderData: Omit<Order, 'id' | 'createdAt'>) => void;
}

export const EditOrderDialog: React.FC<EditOrderDialogProps> = ({
  order,
  open,
  onOpenChange,
  onSave
}) => {
  const [paidAmount, setPaidAmount] = useState(0);
  const [isDispatched, setIsDispatched] = useState(false);
  const [returnDate, setReturnDate] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (order) {
      setPaidAmount(order.paidAmount);
      setIsDispatched(order.isDispatched || false);
      setReturnDate(order.returnDate ? new Date(order.returnDate).toISOString().split('T')[0] : '');
      setItems(order.items || []);
    }
  }, [order]);

  const handleSave = () => {
    if (!order) return;

    const updatedOrderData: Omit<Order, 'id' | 'createdAt'> = {
      customerId: order.customerId,
      customerName: order.customerName,
      type: order.type,
      items: items,
      totalPrice: order.totalPrice,
      paidAmount: paidAmount,
      paymentRecords: order.paymentRecords,
      depositAmount: order.depositAmount,
      isDepositRefunded: order.isDepositRefunded,
      depositRefundedDate: order.depositRefundedDate,
      courierMethod: order.courierMethod,
      weddingDate: order.weddingDate,
      courierDate: order.courierDate,
      returnDate: returnDate ? new Date(returnDate).toISOString() : order.returnDate,
      isDispatched: isDispatched,
      dispatchedDate: isDispatched && !order.isDispatched ? new Date().toISOString() : order.dispatchedDate,
      isCancelled: order.isCancelled,
      cancelledDate: order.cancelledDate
    };

    onSave(order.id, updatedOrderData);
  };

  const handleItemReturnToggle = (index: number, isReturned: boolean) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], isReturned };
    setItems(updatedItems);
  };

  if (!order) return null;

  const balance = order.totalPrice - paidAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Order #{order.id.slice(-8)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Order Type and Status */}
          <div className="flex items-center space-x-2">
            <Badge variant={order.type === 'rent' ? 'default' : 'secondary'}>
              {order.type}
            </Badge>
            {order.isCancelled && (
              <Badge variant="destructive">Cancelled</Badge>
            )}
          </div>

          {/* Payment Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <Label className="font-medium">Payment Details</Label>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-medium">Rs. {order.totalPrice}</span>
              </div>
              <div>
                <span className="text-gray-600">Balance:</span>
                <span className={`ml-2 font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Rs. {balance}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="paidAmount">Paid Amount</Label>
              <Input
                id="paidAmount"
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                max={order.totalPrice}
                min={0}
              />
            </div>
          </div>

          {/* Dispatch Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <Label>Dispatched</Label>
            </div>
            <Switch
              checked={isDispatched}
              onCheckedChange={setIsDispatched}
            />
          </div>

          {/* Return Date for Rental Orders */}
          {order.type === 'rent' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4" />
                <Label htmlFor="returnDate">Return Date</Label>
              </div>
              <Input
                id="returnDate"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          )}

          {/* Items with Return Status for Rental Orders */}
          {order.type === 'rent' && items.length > 0 && (
            <div className="space-y-2">
              <Label className="font-medium">Items Return Status</Label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-2">Rs. {item.price}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`return-${index}`} className="text-sm">
                        Returned
                      </Label>
                      <Switch
                        id={`return-${index}`}
                        checked={item.isReturned || false}
                        onCheckedChange={(checked) => handleItemReturnToggle(index, checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
