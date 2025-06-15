
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, DollarSign, TrendingUp, TrendingDown, FileText, Download } from 'lucide-react';
import { Customer, Order } from '@/types/types';
import { AccountReport } from '@/components/AccountReport';

interface AccountsProps {
  customers: Customer[];
  orders: Order[];
}

export const Accounts: React.FC<AccountsProps> = ({ customers, orders }) => {
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [showReport, setShowReport] = useState(false);

  // Filter out cancelled orders for financial calculations
  const activeOrders = orders.filter(order => !order.isCancelled);

  // Calculate overall financial metrics
  const totalRevenue = activeOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalReceived = activeOrders.reduce((sum, order) => sum + order.paidAmount, 0);
  const totalOutstanding = totalRevenue - totalReceived;

  // Calculate order statistics
  const totalActiveOrders = activeOrders.length;
  const rentOrders = activeOrders.filter(order => order.type === 'rent').length;
  const saleOrders = activeOrders.filter(order => order.type === 'sale').length;
  const dispatchedOrders = activeOrders.filter(order => order.isDispatched).length;
  const pendingOrders = totalActiveOrders - dispatchedOrders;

  // Customer account summary
  const customerAccounts = useMemo(() => {
    return customers.map(customer => {
      const customerOrders = activeOrders.filter(order => order.customerId === customer.id);
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const totalPaid = customerOrders.reduce((sum, order) => sum + order.paidAmount, 0);
      const balance = totalSpent - totalPaid;

      return {
        customer,
        totalOrders: customerOrders.length,
        totalSpent,
        totalPaid,
        balance
      };
    }).filter(account => account.totalOrders > 0); // Only show customers with orders
  }, [customers, activeOrders]);

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
        <div className="flex items-center space-x-4">
          <Select value={reportPeriod} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setReportPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Generate {reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Report
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {totalRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Received</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {totalReceived}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {totalOutstanding}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalActiveOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Order Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{rentOrders}</p>
              <p className="text-sm text-gray-500">Rental Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{saleOrders}</p>
              <p className="text-sm text-gray-500">Sale Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{dispatchedOrders}</p>
              <p className="text-sm text-gray-500">Dispatched</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{pendingOrders}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerAccounts.map((account) => (
                <TableRow key={account.customer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{account.customer.name}</p>
                      <p className="text-sm text-gray-500">{account.customer.contactNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>{account.totalOrders}</TableCell>
                  <TableCell>Rs. {account.totalSpent}</TableCell>
                  <TableCell className="text-green-600">Rs. {account.totalPaid}</TableCell>
                  <TableCell className={account.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                    Rs. {account.balance}
                  </TableCell>
                  <TableCell>
                    {account.balance === 0 ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-800">Outstanding</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {customerAccounts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No customer accounts found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Report */}
      {showReport && (
        <AccountReport
          orders={activeOrders}
          customers={customers}
          period={reportPeriod}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};
