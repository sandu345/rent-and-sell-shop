// pages/Dashboard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, CheckCircle, Truck, Loader2, RefreshCw } from 'lucide-react';
import { OrderList } from '@/components/OrderList';
import { useDashboardOrders } from '@/hooks/useDashboardOrders';
import { Button } from '@/components/ui/button';

export const Dashboard: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const { orders, loading, error, refreshOrders } = useDashboardOrders();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const today = new Date().toDateString();
  
  // Filter out cancelled orders for all dashboard calculations
  const activeOrders = orders.filter(order => !order.isCancelled);
  
  const todayDispatch = activeOrders.filter(order => 
    !order.isDispatched && new Date(order.courierDate).toDateString() === today
  );
  
  const todayReturn = activeOrders.filter(order => 
    order.type === 'rent' && order.returnDate && 
    new Date(order.returnDate).toDateString() === today
  );
  
  const overdueDispatch = activeOrders.filter(order => 
    !order.isDispatched &&
    new Date(order.courierDate) < new Date() && 
    new Date(order.courierDate).toDateString() !== today
  );
  
  const overdueReturn = activeOrders.filter(order => 
    order.type === 'rent' && order.returnDate && 
    new Date(order.returnDate) < new Date() && 
    new Date(order.returnDate).toDateString() !== today
  );

  const getFilteredOrders = () => {
    switch (selectedFilter) {
      case 'todayDispatch': return todayDispatch;
      case 'todayReturn': return todayReturn;
      case 'overdueDispatch': return overdueDispatch;
      case 'overdueReturn': return overdueReturn;
      default: return activeOrders;
    }
  };

  const dashboardCards = [
    {
      title: 'Today\'s Dispatch',
      count: todayDispatch.length,
      icon: Truck,
      color: 'bg-blue-500',
      filter: 'todayDispatch'
    },
    {
      title: 'Today\'s Returns',
      count: todayReturn.length,
      icon: CheckCircle,
      color: 'bg-green-500',
      filter: 'todayReturn'
    },
    {
      title: 'Overdue Dispatch',
      count: overdueDispatch.length,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      filter: 'overdueDispatch'
    },
    {
      title: 'Overdue Returns',
      count: overdueReturn.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      filter: 'overdueReturn'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={refreshOrders} 
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.filter}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedFilter === card.filter ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedFilter(selectedFilter === card.filter ? null : card.filter)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.count}</div>
                {card.count > 0 && (
                  <Badge variant="secondary" className="mt-1">
                    Click to view
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtered Orders */}
      {selectedFilter && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {dashboardCards.find(card => card.filter === selectedFilter)?.title}
            </h2>
            <button
              onClick={() => setSelectedFilter(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear filter
            </button>
          </div>
          <OrderList orders={getFilteredOrders()} />
        </div>
      )}

      {/* Recent Orders */}
      {!selectedFilter && activeOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <OrderList orders={activeOrders.slice(0, 10)} />
        </div>
      )}

      {/* Empty State */}
      {!selectedFilter && activeOrders.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Create your first order to get started.</p>
        </div>
      )}
    </div>
  );
};