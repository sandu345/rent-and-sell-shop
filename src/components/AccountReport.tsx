// components/AccountReport.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Download, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import { useAccountsOrders, useAccountsSummary } from '@/hooks/useAccounts';
import { useCustomers } from '@/hooks/useCustomers';

interface AccountReportProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  onClose: () => void;
}

export const AccountReport: React.FC<AccountReportProps> = ({ period, onClose }) => {
  const { summary, loading: summaryLoading, error: summaryError } = useAccountsSummary();
  const { orders, loading: ordersLoading } = useAccountsOrders(period);
  
  // Use your existing useCustomers hook with a large page size to get all customers
  const { customers, loading: customersLoading } = useCustomers(1, 1000);

  const loading = summaryLoading || ordersLoading || customersLoading;
  const error = summaryError;

  const formatPeriodTitle = () => {
    const now = new Date();
    
    switch (period) {
      case 'daily':
        return `Daily Report - ${now.toLocaleDateString()}`;
      case 'weekly':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        return `Weekly Report - ${startOfWeek.toLocaleDateString()} to ${endOfWeek.toLocaleDateString()}`;
      case 'monthly':
        return `Monthly Report - ${now.toLocaleDateString('default', { month: 'long', year: 'numeric' })}`;
      case 'yearly':
        return `Yearly Report - ${now.getFullYear()}`;
    }
  };

  const handleDownload = () => {
    if (!summary || !orders.length) return;

    const periodSummary = summary[period];
    
    const reportContent = `
${formatPeriodTitle()}
Generated on: ${new Date().toLocaleDateString()}

FINANCIAL SUMMARY
Expected Revenue: Rs. ${periodSummary.expectedRevenue.toLocaleString()}
Total Received: Rs. ${periodSummary.revenue.toLocaleString()}
Total Outstanding: Rs. ${periodSummary.pendingAmount.toLocaleString()}
Total Orders: ${periodSummary.ordersCount}
Growth: ${periodSummary.growthPercentage}% (vs previous ${period})

CUSTOMER DETAILS
${customers.map(customer => {
  const customerOrders = orders.filter(order => order.customer === customer._id);
  if (customerOrders.length === 0) return '';
  
  const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalPaid = customerOrders.reduce((sum, order) => sum + order.paidAmount, 0);
  const balance = totalSpent - totalPaid;
  
  return `
Customer: ${customer.name}
Contact: ${customer.contactNumber}
Orders: ${customerOrders.length}
Total Spent: Rs. ${totalSpent.toLocaleString()}
Total Paid: Rs. ${totalPaid.toLocaleString()}
Balance: Rs. ${balance.toLocaleString()}`;
}).filter(Boolean).join('\n')}

ORDER DETAILS
${orders.map(order => `
Order ID: ${order._id.slice(-8)}
Customer: ${order.customerName}
Type: ${order.type}
Total: Rs. ${order.totalAmount.toLocaleString()}
Paid: Rs. ${order.paidAmount.toLocaleString()}
Balance: Rs. ${(order.totalAmount - order.paidAmount).toLocaleString()}
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

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading report...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !summary) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load report</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const periodSummary = summary[period];

  // Group orders by customer for customer summary
  const customerReports = customers.map(customer => {
    const customerOrders = orders.filter(order => order.customer === customer._id);
    if (customerOrders.length === 0) return null;

    const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Expected Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    Rs. {periodSummary.expectedRevenue.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Total Received</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rs. {periodSummary.revenue.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">
                    Rs. {periodSummary.pendingAmount.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Growth</p>
                  <p className={`text-2xl font-bold ${periodSummary.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {periodSummary.growthPercentage >= 0 ? '+' : ''}{periodSummary.growthPercentage}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Summary */}
          {customerReports.length > 0 && (
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
                    {customerReports.map((report) => (
                      <TableRow key={report.customer._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{report.customer.name}</p>
                            <p className="text-sm text-gray-500">{report.customer.contactNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>{report.orders.length}</TableCell>
                        <TableCell>Rs. {report.totalSpent.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">Rs. {report.totalPaid.toLocaleString()}</TableCell>
                        <TableCell className={report.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                          Rs. {report.balance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details ({periodSummary.ordersCount} orders)</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
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
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono">#{order._id.slice(-8)}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          <Badge variant={order.type === 'rent' ? 'default' : 'secondary'} className="capitalize">
                            {order.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>Rs. {order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">Rs. {order.paidAmount.toLocaleString()}</TableCell>
                        <TableCell className={order.totalAmount - order.paidAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                          Rs. {(order.totalAmount - order.paidAmount).toLocaleString()}
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
              ) : (
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