// hooks/useDashboardOrders.ts
import { useState, useEffect } from 'react';
import { orderAPI, Order } from '@/services/api';

interface UseDashboardOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refreshOrders: () => void;
}

export const useDashboardOrders = (): UseDashboardOrdersResult => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all orders without pagination for dashboard
      const response = await orderAPI.getOrders({
        limit: 1000, // Get a large number to include all orders
      });
      
      setOrders(response.orders || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      console.error('Dashboard orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refreshOrders,
  };
};