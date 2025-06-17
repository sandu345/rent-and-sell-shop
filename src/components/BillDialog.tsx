
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer, Order } from '@/types/types';
import { Bill } from './Bill';

interface BillDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  order: Order;
}

export const BillDialog: React.FC<BillDialogProps> = ({
  isOpen,
  onOpenChange,
  customer,
  order
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Bill</DialogTitle>
        </DialogHeader>
        <Bill customer={customer} order={order} />
      </DialogContent>
    </Dialog>
  );
};
