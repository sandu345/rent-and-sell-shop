
// import React, { useState } from 'react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Input } from '@/components/ui/input';
// import { Order } from '@/types/types';

// // interface OrderTableProps {
// //   orders: Order[];
// //   onEditOrder?: (order: Order) => void;
// // }

// interface OrderTableProps {
//   orders: Order[];
//   onEditOrder: (order: Order) => void;
//   onAddPayment?: (order: Order) => void;
//   onMarkDispatched?: (orderId: string) => void;
//   onCancelOrder?: (id: string) => void;
// }

// export const OrderTable: React.FC<OrderTableProps> = ({ orders, onEditOrder }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [typeFilter, setTypeFilter] = useState<'all' | 'rent' | 'sale'>('all');
//   const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('all');
//   const [dispatchFilter, setDispatchFilter] = useState<'all' | 'today' | 'scheduled' | 'overdue'>('all');
//   const [returnFilter, setReturnFilter] = useState<'all' | 'returned' | 'partial' | 'not_returned'>('all');

//   const getDispatchStatus = (order: Order) => {
//     if (order.isDispatched) {
//       return { text: 'Dispatched', color: 'bg-gray-100 text-gray-800', status: 'dispatched' };
//     }
    
//     const today = new Date();
//     const courierDate = new Date(order.courierDate);
    
//     if (courierDate < today && courierDate.toDateString() !== today.toDateString()) {
//       return { text: 'Overdue', color: 'bg-red-100 text-red-800', status: 'overdue' };
//     }
//     if (courierDate.toDateString() === today.toDateString()) {
//       return { text: 'Today', color: 'bg-orange-100 text-orange-800', status: 'today' };
//     }
//     return { text: 'Scheduled', color: 'bg-green-100 text-green-800', status: 'scheduled' };
//   };

//   const getPaymentStatus = (order: Order) => {
//     const balance = order.totalAmount - order.paidAmount;
//     if (balance === 0) return { text: 'Paid', color: 'bg-green-100 text-green-800' };
//     if (order.paidAmount === 0) return { text: 'Unpaid', color: 'bg-red-100 text-red-800' };
//     return { text: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
//   };

//   const getReturnStatus = (order: Order) => {
//     if (order.orderType === 'sale') {
//       return { text: 'N/A', color: 'bg-gray-100 text-gray-500' };
//     }
    
//     const totalItems = order.items.length;
//     const returnedItems = order.items.filter(item => item.isReturned).length;
    
//     if (returnedItems === 0) {
//       return { text: 'Not Returned', color: 'bg-red-100 text-red-800' };
//     }
//     if (returnedItems === totalItems) {
//       return { text: 'Returned', color: 'bg-green-100 text-green-800' };
//     }
//     return { text: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
//   };

//   const filteredOrders = orders.filter(order => {
//     // Search filter
//     const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          order._id.toLowerCase().includes(searchTerm.toLowerCase());
    
//     // Type filter
//     const matchesType = typeFilter === 'all' || order.orderType === typeFilter;
    
//     // Status filter
//     let matchesStatus = true;
//     if (statusFilter === 'active') {
//       matchesStatus = !order.isCancelled;
//     } else if (statusFilter === 'cancelled') {
//       matchesStatus = !!order.isCancelled;
//     }
    
//     // Dispatch filter (only for rent orders and non-cancelled orders)
//     let matchesDispatch = true;
//     if (dispatchFilter !== 'all' && order.orderType === 'rent' && !order.isCancelled) {
//       const dispatchStatus = getDispatchStatus(order);
//       matchesDispatch = dispatchStatus.status === dispatchFilter;
//     }
    
//     // Return filter (only for rent orders and non-cancelled orders)
//     let matchesReturn = true;
//     if (returnFilter !== 'all' && order.orderType === 'rent' && !order.isCancelled) {
//       const returnStatus = getReturnStatus(order);
//       const statusMap = {
//         'returned': 'Returned',
//         'partial': 'Partial',
//         'not_returned': 'Not Returned'
//       };
//       matchesReturn = returnStatus.text === statusMap[returnFilter];
//     }
    
//     return matchesSearch && matchesType && matchesStatus && matchesDispatch && matchesReturn;
//   });

//   const handleRowClick = (order: Order) => {
//     if (onEditOrder && !order.isCancelled) {
//       onEditOrder(order);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="flex-1">
//           <Input
//             placeholder="Search by customer name or order ID..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
        
//         <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'cancelled') => setStatusFilter(value)}>
//           <SelectTrigger className="w-40">
//             <SelectValue placeholder="Order Status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Orders</SelectItem>
//             <SelectItem value="active">Active</SelectItem>
//             <SelectItem value="cancelled">Cancelled</SelectItem>
//           </SelectContent>
//         </Select>
        
//         <Select value={typeFilter} onValueChange={(value: 'all' | 'rent' | 'sale') => setTypeFilter(value)}>
//           <SelectTrigger className="w-40">
//             <SelectValue placeholder="Order Type" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Types</SelectItem>
//             <SelectItem value="rent">Rental</SelectItem>
//             <SelectItem value="sale">Sale</SelectItem>
//           </SelectContent>
//         </Select>
        
//         {typeFilter === 'rent' && statusFilter !== 'cancelled' && (
//           <>
//             <Select value={dispatchFilter} onValueChange={(value: 'all' | 'today' | 'scheduled' | 'overdue') => setDispatchFilter(value)}>
//               <SelectTrigger className="w-40">
//                 <SelectValue placeholder="Dispatch Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Dispatch</SelectItem>
//                 <SelectItem value="today">Today</SelectItem>
//                 <SelectItem value="scheduled">Scheduled</SelectItem>
//                 <SelectItem value="overdue">Overdue</SelectItem>
//               </SelectContent>
//             </Select>
            
//             <Select value={returnFilter} onValueChange={(value: 'all' | 'returned' | 'partial' | 'not_returned') => setReturnFilter(value)}>
//               <SelectTrigger className="w-40">
//                 <SelectValue placeholder="Return Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Returns</SelectItem>
//                 <SelectItem value="returned">Returned</SelectItem>
//                 <SelectItem value="partial">Partial</SelectItem>
//                 <SelectItem value="not_returned">Not Returned</SelectItem>
//               </SelectContent>
//             </Select>
//           </>
//         )}
//       </div>

//       {/* Table */}
//       <div className="border rounded-lg">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Order ID</TableHead>
//               <TableHead>Customer</TableHead>
//               <TableHead>Created Date</TableHead>
//               <TableHead>Type</TableHead>
//               <TableHead>Dispatch Status</TableHead>
//               <TableHead>Payment Status</TableHead>
//               <TableHead>Return Status</TableHead>
//               <TableHead>Deposit Refunded</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredOrders.map((order) => {
//               const dispatchStatus = getDispatchStatus(order);
//               const paymentStatus = getPaymentStatus(order);
//               const returnStatus = getReturnStatus(order);
//               const isCancelled = order.isCancelled;
              
//               return (
//                 <TableRow 
//                   key={order._id} 
//                   className={`${!isCancelled ? 'cursor-pointer hover:bg-gray-50' : 'opacity-70'} ${isCancelled ? 'line-through' : ''}`}
//                   onClick={() => handleRowClick(order)}
//                 >
//                   <TableCell className="font-medium">
//                     <div className={isCancelled ? 'line-through' : ''}>
//                       #{order._id.slice(-8)}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className={isCancelled ? 'line-through' : ''}>
//                       {order.customerName}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className={isCancelled ? 'line-through' : ''}>
//                       {new Date(order.createdAt).toLocaleDateString()}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     {isCancelled ? (
//                       <Badge variant="destructive" className="line-through">
//                         Cancelled
//                       </Badge>
//                     ) : (
//                       <Badge variant={order.orderType === 'rent' ? 'default' : 'secondary'} className="capitalize">
//                         {order.orderType}
//                       </Badge>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {isCancelled ? (
//                       <Badge className="bg-gray-100 text-gray-500 line-through">
//                         Cancelled
//                       </Badge>
//                     ) : (
//                       <Badge className={dispatchStatus.color}>
//                         {dispatchStatus.text}
//                       </Badge>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {isCancelled ? (
//                       <Badge className="bg-gray-100 text-gray-500 line-through">
//                         Cancelled
//                       </Badge>
//                     ) : (
//                       <Badge className={paymentStatus.color}>
//                         {paymentStatus.text}
//                       </Badge>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {isCancelled ? (
//                       <Badge className="bg-gray-100 text-gray-500 line-through">
//                         Cancelled
//                       </Badge>
//                     ) : (
//                       <Badge className={returnStatus.color}>
//                         {returnStatus.text}
//                       </Badge>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {isCancelled ? (
//                       <Badge className="bg-gray-100 text-gray-500 line-through">
//                         Cancelled
//                       </Badge>
//                     ) : order.orderType === 'rent' && order.depositAmount ? (
//                       <Badge className={order.isDepositRefunded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
//                         {order.isDepositRefunded ? 'Refunded' : 'Not Refunded'}
//                       </Badge>
//                     ) : (
//                       <Badge className="bg-gray-100 text-gray-500">N/A</Badge>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </div>
      
//       {filteredOrders.length === 0 && (
//         <div className="text-center py-8 text-gray-500">
//           <p>No orders found matching the filters.</p>
//         </div>
//       )}
//     </div>
//   );
// };


import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Order } from '@/types/types';

interface OrderTableProps {
  orders: Order[];
  onEditOrder: (order: Order) => void;
  onAddPayment?: (order: Order) => void;
  onMarkDispatched?: (orderId: string) => void;
  onCancelOrder?: (id: string) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders, onEditOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'rent' | 'sale'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('all');
  const [dispatchFilter, setDispatchFilter] = useState<'all' | 'today' | 'scheduled' | 'overdue'>('all');
  const [returnFilter, setReturnFilter] = useState<'all' | 'returned' | 'partial' | 'not_returned'>('all');

  // Add safety check for orders
  if (!orders || !Array.isArray(orders)) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Loading orders...</p>
      </div>
    );
  }

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
    const totalAmount = order.totalAmount || 0;
    const paidAmount = order.paidAmount || 0;
    const balance = totalAmount - paidAmount;
    
    if (balance === 0) return { text: 'Paid', color: 'bg-green-100 text-green-800' };
    if (paidAmount === 0) return { text: 'Unpaid', color: 'bg-red-100 text-red-800' };
    return { text: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getReturnStatus = (order: Order) => {
    if (order.type === 'sale') {
      return { text: 'N/A', color: 'bg-gray-100 text-gray-500' };
    }
    
    const items = order.items || [];
    const totalItems = items.length;
    const returnedItems = items.filter(item => item.isReturned).length;
    
    if (returnedItems === 0) {
      return { text: 'Not Returned', color: 'bg-red-100 text-red-800' };
    }
    if (returnedItems === totalItems) {
      return { text: 'Returned', color: 'bg-green-100 text-green-800' };
    }
    return { text: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
  };

  const filteredOrders = orders.filter(order => {
    // Add null checks for all properties
    if (!order) return false;
    
    // Search filter - with null checks
    const customerName = order.customerName || '';
    const orderId = order._id || '';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orderId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = typeFilter === 'all' || order.type === typeFilter;
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = !order.isCancelled;
    } else if (statusFilter === 'cancelled') {
      matchesStatus = !!order.isCancelled;
    }
    
    // Dispatch filter (only for rent orders and non-cancelled orders)
    let matchesDispatch = true;
    if (dispatchFilter !== 'all' && order.type === 'rent' && !order.isCancelled) {
      const dispatchStatus = getDispatchStatus(order);
      matchesDispatch = dispatchStatus.status === dispatchFilter;
    }
    
    // Return filter (only for rent orders and non-cancelled orders)
    let matchesReturn = true;
    if (returnFilter !== 'all' && order.type === 'rent' && !order.isCancelled) {
      const returnStatus = getReturnStatus(order);
      const statusMap = {
        'returned': 'Returned',
        'partial': 'Partial',
        'not_returned': 'Not Returned'
      };
      matchesReturn = returnStatus.text === statusMap[returnFilter];
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDispatch && matchesReturn;
  });

  const handleRowClick = (order: Order) => {
    if (onEditOrder && !order.isCancelled) {
      onEditOrder(order);
    }
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
        
        <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'cancelled') => setStatusFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
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
        
        {typeFilter === 'rent' && statusFilter !== 'cancelled' && (
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
              // Add safety checks for each order
              if (!order || !order._id) return null;
              
              const dispatchStatus = getDispatchStatus(order);
              const paymentStatus = getPaymentStatus(order);
              const returnStatus = getReturnStatus(order);
              const isCancelled = order.isCancelled;
              
              return (
                <TableRow 
                  key={order._id} 
                  className={`${!isCancelled ? 'cursor-pointer hover:bg-gray-50' : 'opacity-70'} ${isCancelled ? 'line-through' : ''}`}
                  onClick={() => handleRowClick(order)}
                >
                  <TableCell className="font-medium">
                    <div className={isCancelled ? 'line-through' : ''}>
                      #{(order._id || '').slice(-8)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={isCancelled ? 'line-through' : ''}>
                      {order.customerName || 'Unknown Customer'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={isCancelled ? 'line-through' : ''}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isCancelled ? (
                      <Badge variant="destructive" className="line-through">
                        Cancelled
                      </Badge>
                    ) : (
                      <Badge variant={order.type === 'rent' ? 'default' : 'secondary'} className="capitalize">
                        {order.type || 'Unknown'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isCancelled ? (
                      <Badge className="bg-gray-100 text-gray-500 line-through">
                        Cancelled
                      </Badge>
                    ) : (
                      <Badge className={dispatchStatus.color}>
                        {dispatchStatus.text}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isCancelled ? (
                      <Badge className="bg-gray-100 text-gray-500 line-through">
                        Cancelled
                      </Badge>
                    ) : (
                      <Badge className={paymentStatus.color}>
                        {paymentStatus.text}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isCancelled ? (
                      <Badge className="bg-gray-100 text-gray-500 line-through">
                        Cancelled
                      </Badge>
                    ) : (
                      <Badge className={returnStatus.color}>
                        {returnStatus.text}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isCancelled ? (
                      <Badge className="bg-gray-100 text-gray-500 line-through">
                        Cancelled
                      </Badge>
                    ) : order.type === 'rent' && order.depositAmount ? (
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