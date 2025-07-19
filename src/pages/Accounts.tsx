// pages/Accounts.tsx - Complete updated component with better debugging
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, DollarSign, TrendingUp, TrendingDown, FileText, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { AccountReport } from '@/components/AccountReport';
import { useAccountsCustomers, useAccountsSummary } from '@/hooks/useAccounts';
import { useCustomers } from '@/hooks/useCustomers';
import { useDashboardOrders } from '@/hooks/useDashboardOrders';

export const Accounts: React.FC = () => {
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [showReport, setShowReport] = useState(false);

  const { summary, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useAccountsSummary();
  const { customers, loading: customersLoading, error: customersError, refreshCustomers } = useCustomers(1, 1000);
  const { orders, loading: ordersLoading, error: ordersError, refreshOrders } = useDashboardOrders();

  const loading = summaryLoading || customersLoading || ordersLoading;
  const error = summaryError || customersError || ordersError;

  // Filter out cancelled orders for financial calculations
  const activeOrders = orders.filter(order => !order.isCancelled);

  // Calculate overall financial metrics from current summary
// Replace the currentSummary calculation with this:
const currentSummary = summary?.[reportPeriod] || {
  revenue: 0,
  expectedRevenue: 0,
  pendingAmount: 0,
  ordersCount: 0,
  growthPercentage: 0
};

  // Calculate order statistics
  const totalActiveOrders = activeOrders.length;
  const rentOrders = activeOrders.filter(order => order.type === 'rent').length;
  const saleOrders = activeOrders.filter(order => order.type === 'sale').length;
  const dispatchedOrders = activeOrders.filter(order => order.isDispatched).length;
  const pendingOrders = totalActiveOrders - dispatchedOrders;

  // Customer account summary with better debugging
  // Add types for customer and order to avoid 'never' errors
  type Customer = {
    _id: string;
    name: string;
    contactNumber?: string;
  };
  
  type Order = {
    _id: string;
    customer: string | { _id: string };
    type: string;
    isCancelled?: boolean;
    isDispatched?: boolean;
    totalAmount?: number;
    paidAmount?: number;
  };
  

  // Replace the existing customerAccounts useMemo with:
const { customerAccounts, loading: customerAccountsLoading } = useAccountsCustomers(reportPeriod);


    // const customerAccounts = useMemo(() => {
    //   console.log('=== Customer Accounts Debug ===');
    //   console.log('Customers count:', customers.length);
    //   console.log('Active orders count:', activeOrders.length);
      
    //   if (!customers.length) {
    //     console.log('No customers available');
    //     return [];
    //   }
      
    //   if (!activeOrders.length) {
    //     console.log('No active orders available');
    //     return [];
    //   }
  
    //   // Log sample data
    //   if (customers.length > 0) {
    //     console.log('Sample customer:', customers[0]);
    //   }
    //   if (activeOrders.length > 0) {
    //     console.log('Sample order:', activeOrders[0]);
    //   }
  
    //   // Create a map of customer names for easier debugging
    //   const customerMap = new Map();
    //   customers.forEach((customer: Customer) => {
    //     customerMap.set(customer._id, customer.name);
    //   });
  
    //   console.log('Customer ID map:', Array.from(customerMap.entries()));
  
    //   const accounts = customers.map((customer: Customer) => {
    //     const customerOrders = activeOrders.filter((order: Order) => {
    //       // Handle different possible formats of customer field
    //       let orderCustomerId: string | undefined;
          
    //       if (typeof order.customer === 'string') {
    //         orderCustomerId = order.customer;
    //       } else if (order.customer && typeof order.customer === 'object' && '_id' in order.customer) {
    //         orderCustomerId = (order.customer as { _id: string })._id;
    //       } else {
    //         console.log('Unexpected customer format in order:', order);
    //         return false;
    //       }
          
    //       const match = orderCustomerId === customer._id;
    //       if (match) {
    //         console.log(`✅ Match found: Order ${order._id} belongs to customer ${customer.name}`);
    //       }
          
    //       return match;
    //     });
  
    //     const totalSpent = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    //     const totalPaid = customerOrders.reduce((sum, order) => sum + (order.paidAmount || 0), 0);
    //     const balance = totalSpent - totalPaid;
  
    //     const account = {
    //       customer,
    //       totalOrders: customerOrders.length,
    //       totalSpent,
    //       totalPaid,
    //       balance
    //     };
  
    //     if (customerOrders.length > 0) {
    //       console.log(`Customer ${customer.name} account:`, account);
    //     }
  
    //     return account;
    //   }).filter(account => account.totalOrders > 0);
  
    //   console.log('Final customer accounts:', accounts.length);
    //   console.log('=== End Debug ===');
      
    //   return accounts;
    // }, [customers, activeOrders]);

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  const handleRefresh = () => {
    refetchSummary();
    refreshCustomers();
    refreshOrders();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load accounts
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
        <div className="flex items-center space-x-4">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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

      {/* Debug Info Card - Remove this after fixing */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Customers loaded: {customers.length}</p>
            <p>Active orders: {activeOrders.length}</p>
            <p>Customer accounts found: {customerAccounts.length}</p>
            {customers.length > 0 && (
              <p>Sample customer ID: {customers[0]._id}</p>
            )}
            {activeOrders.length > 0 && (
              <p>Sample order customer: {JSON.stringify(activeOrders[0].customer)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
{/* Financial Overview */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <DollarSign className="h-8 w-8 text-green-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">
            Expected Revenue ({reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)})
          </p>
          <p className="text-2xl font-bold text-gray-900">
            Rs. {currentSummary.expectedRevenue.toLocaleString()}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
  
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <TrendingUp className="h-8 w-8 text-blue-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">
            Total Received ({reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)})
          </p>
          <p className="text-2xl font-bold text-gray-900">
            Rs. {currentSummary.revenue.toLocaleString()}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
  
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <TrendingDown className="h-8 w-8 text-red-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">
            Outstanding ({reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)})
          </p>
          <p className="text-2xl font-bold text-gray-900">
            Rs. {currentSummary.pendingAmount.toLocaleString()}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
  
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <Calendar className="h-8 w-8 text-purple-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">
            Orders ({reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)})
          </p>
          <p className="text-2xl font-bold text-gray-900">{currentSummary.ordersCount}</p>
          {currentSummary.growthPercentage !== 0 && (
            <p className={`text-sm ${currentSummary.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentSummary.growthPercentage >= 0 ? '+' : ''}{currentSummary.growthPercentage}% vs prev {reportPeriod}
            </p>
          )}
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
                <TableRow key={account.customer._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{account.customer.name}</p>
                      <p className="text-sm text-gray-500">{account.customer.contactNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>{account.totalOrders}</TableCell>
                  <TableCell>Rs. {account.totalSpent.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">Rs. {account.totalPaid.toLocaleString()}</TableCell>
                  <TableCell className={account.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                    Rs. {account.balance.toLocaleString()}
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
              <p className="text-xs text-gray-400 mt-2">
                Customers: {customers.length}, Orders: {activeOrders.length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Report */}
      {showReport && (
        <AccountReport
          period={reportPeriod}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};