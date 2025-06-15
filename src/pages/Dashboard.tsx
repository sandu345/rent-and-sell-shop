
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, CheckCircle, Truck } from 'lucide-react';
import { Order } from '@/types/types';
import { OrderList } from '@/components/OrderList';

interface DashboardProps {
  orders: Order[];
}

export const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const today = new Date().toDateString();
  
  const todayDispatch = orders.filter(order => 
    new Date(order.courierDate).toDateString() === today
  );
  
  const todayReturn = orders.filter(order => 
    order.type === 'rent' && order.returnDate && 
    new Date(order.returnDate).toDateString() === today
  );
  
  const overdueDispatch = orders.filter(order => 
    new Date(order.courierDate) < new Date() && 
    new Date(order.courierDate).toDateString() !== today
  );
  
  const overdueReturn = orders.filter(order => 
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
      default: return orders;
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
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

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

      {!selectedFilter && orders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <OrderList orders={orders.slice(0, 5)} />
        </div>
      )}
    </div>
  );
};
