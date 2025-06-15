
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Download, Calendar } from 'lucide-react';
import { Customer, Order } from '@/types/types';

interface AccountReportProps {
  orders: Order[];
  customers: Customer[];
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  onClose: () => void;
}

export const AccountReport: React.FC<AccountReportProps> = ({ orders, customers, period, onClose }) => {
  const reportData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= now;
    });

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalReceived = filteredOrders.reduce((sum, order) => sum + order.paidAmount, 0);
    const totalOutstanding = totalRevenue - totalReceived;

    // Group orders by customer
    const customerReports = customers.map(customer => {
      const customerOrders = filteredOrders.filter(order => order.customerId === customer.id);
      if (customerOrders.length === 0) return null;

      const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const totalPaid = customerOrders.reduce((sum, order) => sum + order.paidAmount, 0);
      const balance = totalSpent - totalPaid;

      return {
        customer,
        orders: customerOrders,
        totalSpent,
        totalPaid,
        balance
      };
    }).filter(Boolean);

    return {
      startDate,
      endDate: now,
      orders: filteredOrders,
      totalRevenue,
      totalReceived,
      totalOutstanding,
      customerReports
    };
  }, [orders, customers, period]);

  const formatPeriodTitle = () => {
    const { startDate, endDate } = reportData;
    
    switch (period) {
      case 'daily':
        return `Daily Report - ${startDate.toLocaleDateString()}`;
      case 'weekly':
        return `Weekly Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
      case 'monthly':
        return `Monthly Report - ${startDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}`;
      case 'yearly':
        return `Yearly Report - ${startDate.getFullYear()}`;
    }
  };

  const handleDownload = () => {
    // Create a simple text report for download
    const reportContent = `
${formatPeriodTitle()}
Generated on: ${new Date().toLocaleDateString()}

FINANCIAL SUMMARY
Total Revenue: Rs. ${reportData.totalRevenue}
Total Received: Rs. ${reportData.totalReceived}
Total Outstanding: Rs. ${reportData.totalOutstanding}

CUSTOMER DETAILS
${reportData.customerReports.map(report => `
Customer: ${report.customer.name}
Contact: ${report.customer.contactNumber}
Orders: ${report.orders.length}
Total Spent: Rs. ${report.totalSpent}
Total Paid: Rs. ${report.totalPaid}
Balance: Rs. ${report.balance}
`).join('\n')}

ORDER DETAILS
${reportData.orders.map(order => `
Order ID: ${order.id.slice(-8)}
Customer: ${order.customerName}
Type: ${order.type}
Total: Rs. ${order.totalPrice}
Paid: Rs. ${order.paidAmount}
Balance: Rs. ${order.totalPrice - order.paidAmount}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.isDispatched ? 'Dispatched' : 'Pending'}
`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account-report-${period}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {formatPeriodTitle()}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">Rs. {reportData.totalRevenue}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Total Received</p>
                  <p className="text-2xl font-bold text-blue-600">Rs. {reportData.totalReceived}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">Rs. {reportData.totalOutstanding}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.customerReports.map((report) => (
                    <TableRow key={report.customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.customer.name}</p>
                          <p className="text-sm text-gray-500">{report.customer.contactNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>{report.orders.length}</TableCell>
                      <TableCell>Rs. {report.totalSpent}</TableCell>
                      <TableCell className="text-green-600">Rs. {report.totalPaid}</TableCell>
                      <TableCell className={report.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                        Rs. {report.balance}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">#{order.id.slice(-8)}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <Badge variant={order.type === 'rent' ? 'default' : 'secondary'} className="capitalize">
                          {order.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>Rs. {order.totalPrice}</TableCell>
                      <TableCell className="text-green-600">Rs. {order.paidAmount}</TableCell>
                      <TableCell className={order.totalPrice - order.paidAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                        Rs. {order.totalPrice - order.paidAmount}
                      </TableCell>
                      <TableCell>
                        {order.isDispatched ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Dispatched</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {reportData.orders.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders found for this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
