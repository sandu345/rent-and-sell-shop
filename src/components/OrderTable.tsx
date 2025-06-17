
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Order } from '@/types/types';

interface OrderTableProps {
  orders: Order[];
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'rent' | 'sale'>('all');
  const [dispatchFilter, setDispatchFilter] = useState<'all' | 'today' | 'scheduled' | 'overdue'>('all');
  const [returnFilter, setReturnFilter] = useState<'all' | 'returned' | 'partial' | 'not_returned'>('all');

  // Filter out cancelled orders
  const activeOrders = orders.filter(order => !order.isCancelled);

  const getDispatchStatus = (order: Order) => {
    if (order.isDispatched) {
      return { text: 'Dispatched', color: 'bg-gray-100 text-gray-800', status: 'dispatched' };
    }
    
    const today = new Date();
    const courierDate = new Date(order.courierDate);
    
    if (courierDate < today && courierDate.toDateString() !== today.toDateString()) {
      return { text: 'Overdue', color: 'bg-red-100 text-red-800', status: 'overdue' };
    }
    if (courierDate.toDateString() === today.toDateString()) {
      return { text: 'Today', color: 'bg-orange-100 text-orange-800', status: 'today' };
    }
    return { text: 'Scheduled', color: 'bg-green-100 text-green-800', status: 'scheduled' };
  };

  const getPaymentStatus = (order: Order) => {
    const balance = order.totalPrice - order.paidAmount;
    if (balance === 0) return { text: 'Paid', color: 'bg-green-100 text-green-800' };
    if (order.paidAmount === 0) return { text: 'Unpaid', color: 'bg-red-100 text-red-800' };
    return { text: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getReturnStatus = (order: Order) => {
    if (order.type === 'sale') {
      return { text: 'N/A', color: 'bg-gray-100 text-gray-500' };
    }
    
    const totalItems = order.items.length;
    const returnedItems = order.items.filter(item => item.isReturned).length;
    
    if (returnedItems === 0) {
      return { text: 'Not Returned', color: 'bg-red-100 text-red-800' };
    }
    if (returnedItems === totalItems) {
      return { text: 'Returned', color: 'bg-green-100 text-green-800' };
    }
    return { text: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
  };

  const filteredOrders = activeOrders.filter(order => {
    // Search filter
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = typeFilter === 'all' || order.type === typeFilter;
    
    // Dispatch filter (only for rent orders)
    let matchesDispatch = true;
    if (dispatchFilter !== 'all' && order.type === 'rent') {
      const dispatchStatus = getDispatchStatus(order);
      matchesDispatch = dispatchStatus.status === dispatchFilter;
    }
    
    // Return filter (only for rent orders)
    let matchesReturn = true;
    if (returnFilter !== 'all' && order.type === 'rent') {
      const returnStatus = getReturnStatus(order);
      const statusMap = {
        'returned': 'Returned',
        'partial': 'Partial',
        'not_returned': 'Not Returned'
      };
      matchesReturn = returnStatus.text === statusMap[returnFilter];
    }
    
    return matchesSearch && matchesType && matchesDispatch && matchesReturn;
  });

  const handleRowClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by customer name or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={(value: 'all' | 'rent' | 'sale') => setTypeFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Order Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="rent">Rental</SelectItem>
            <SelectItem value="sale">Sale</SelectItem>
          </SelectContent>
        </Select>
        
        {typeFilter === 'rent' && (
          <>
            <Select value={dispatchFilter} onValueChange={(value: 'all' | 'today' | 'scheduled' | 'overdue') => setDispatchFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Dispatch Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dispatch</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={returnFilter} onValueChange={(value: 'all' | 'returned' | 'partial' | 'not_returned') => setReturnFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Return Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Returns</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="not_returned">Not Returned</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dispatch Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Return Status</TableHead>
              <TableHead>Deposit Refunded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const dispatchStatus = getDispatchStatus(order);
              const paymentStatus = getPaymentStatus(order);
              const returnStatus = getReturnStatus(order);
              
              return (
                <TableRow 
                  key={order.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(order.id)}
                >
                  <TableCell className="font-medium">#{order.id.slice(-8)}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={order.type === 'rent' ? 'default' : 'secondary'} className="capitalize">
                      {order.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={dispatchStatus.color}>
                      {dispatchStatus.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={paymentStatus.color}>
                      {paymentStatus.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={returnStatus.color}>
                      {returnStatus.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.type === 'rent' && order.depositAmount ? (
                      <Badge className={order.isDepositRefunded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {order.isDepositRefunded ? 'Refunded' : 'Not Refunded'}
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500">N/A</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {filteredOrders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No orders found matching the filters.</p>
        </div>
      )}
    </div>
  );
};
