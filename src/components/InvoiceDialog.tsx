
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Printer, FileText } from 'lucide-react';
import { Customer, Order } from '@/types/types';
import { Invoice } from './Invoice';

interface InvoiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  orders: Order[];
}

export const InvoiceDialog: React.FC<InvoiceDialogProps> = ({
  isOpen,
  onOpenChange,
  customer,
  orders
}) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const getFilteredOrders = () => {
    if (!selectedMonth || !selectedYear) return [];
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() + 1 === parseInt(selectedMonth) && 
             orderDate.getFullYear() === parseInt(selectedYear);
    });
  };

  const handleGenerateInvoice = () => {
    if (selectedMonth && selectedYear) {
      setShowInvoice(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredOrders = getFilteredOrders();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
        </DialogHeader>
        
        {!showInvoice ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="month">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedMonth && selectedYear && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Orders for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</h4>
                <p className="text-sm text-gray-600">
                  Found {filteredOrders.length} order(s) for this period
                </p>
                {filteredOrders.length > 0 && (
                  <div className="mt-2 text-sm">
                    <p>Total Amount: Rs. {filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0)}</p>
                    <p>Total Paid: Rs. {filteredOrders.reduce((sum, order) => sum + order.paidAmount, 0)}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateInvoice}
                disabled={!selectedMonth || !selectedYear || filteredOrders.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center print:hidden">
              <Button variant="outline" onClick={() => setShowInvoice(false)}>
                Back to Selection
              </Button>
              <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
            </div>
            
            <Invoice 
              customer={customer}
              orders={filteredOrders}
              month={selectedMonth}
              year={selectedYear}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
