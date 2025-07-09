
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Order } from '@/types/types';
import { toast } from '@/hooks/use-toast';

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
  const [paidAmount, setPaidAmount] = useState(order?.paidAmount || 0);
  const [isDispatched, setIsDispatched] = useState(order?.isDispatched || false);

  React.useEffect(() => {
    if (order) {
      setPaidAmount(order.paidAmount);
      setIsDispatched(order.isDispatched);
    }
  }, [order]);

  const handleSave = () => {
    if (!order) return;

    const updatedOrderData = {
      ...order,
      paidAmount,
      isDispatched,
      dispatchedDate: isDispatched && !order.isDispatched ? new Date().toISOString() : order.dispatchedDate
    };

    const { id, createdAt, ...orderData } = updatedOrderData;
    onSave(order.id, orderData);
    
    toast({
      title: "Order updated",
      description: "Order details have been updated successfully."
    });
    
    onOpenChange(false);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Order #{order.id.slice(-8)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="paidAmount">Paid Amount</Label>
            <Input
              id="paidAmount"
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              min="0"
              max={order.totalPrice}
            />
            <p className="text-sm text-gray-500 mt-1">
              Total: Rs. {order.totalPrice} | Balance: Rs. {order.totalPrice - paidAmount}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDispatched"
              checked={isDispatched}
              onChange={(e) => setIsDispatched(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="isDispatched">Mark as Dispatched</Label>
          </div>
          
          <div className="flex justify-end space-x-2">
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
