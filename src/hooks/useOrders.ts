// hooks/useOrders.ts
import { useState, useEffect, useCallback } from 'react';
import { orderAPI, Order } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { OrderType } from '@/types/types';

interface UseOrdersFilters {
  orderType?: 'rent' | 'sale';
  paymentMethod?: 'pickme' | 'byhand' | 'bus';
  isCompleted?: boolean;
  placedDate?: string;
  weddingDate?: string;
  courierDate?: string;
}

interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  filters: UseOrdersFilters;
  setFilters: (filters: UseOrdersFilters) => void;
  refreshOrders: () => void;
  addOrder: (orderData: OrderType) => Promise<void>;
  updateOrder: (id: string, orderData: any) => Promise<void>;
  addPayment: (id: string, amount: number) => Promise<void>;
  markDispatched: (id: string) => Promise<void>;
  markItemReturned: (orderId: string, itemIndex: number) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  goToPage: (page: number) => void;
  total: number;
}

export const useOrders = (initialPage = 1, pageSize = 10): UseOrdersResult => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<UseOrdersFilters>({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderAPI.getOrders({
        ...filters,
        page: currentPage,
        limit: pageSize,
      });
      
      setOrders(response.orders);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setTotal(response.total || response.orders.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  const addOrder = async (orderData: any) => {
    try {
      await orderAPI.createOrder(orderData);
      toast({
        title: 'Success',
        description: 'Order created successfully',
      });
      await fetchOrders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateOrder = async (id: string, orderData: any) => {
    try {
      await orderAPI.updateOrder(id, orderData);
      toast({
        title: 'Success',
        description: 'Order updated successfully',
      });
      await fetchOrders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const addPayment = async (id: string, amount: number) => {
    try {
      await orderAPI.addPayment(id, amount);
      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });
      await fetchOrders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record payment';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const markDispatched = async (id: string) => {
    try {
      await orderAPI.markDispatched(id);
      toast({
        title: 'Success',
        description: 'Order marked as dispatched',
      });
      await fetchOrders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as dispatched';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const markItemReturned = async (orderId: string, itemIndex: number) => {
    try {
      await orderAPI.markItemReturned(orderId, itemIndex);
      toast({
        title: 'Success',
        description: 'Item marked as returned',
      });
      await fetchOrders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark item as returned';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      await orderAPI.cancelOrder(id);
      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });
      await fetchOrders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return {
    orders,
    loading,
    error,
    totalPages,
    currentPage,
    filters,
    setFilters,
    refreshOrders,
    addOrder,
    updateOrder,
    addPayment,
    markDispatched,
    markItemReturned,
    cancelOrder,
    goToPage,
    total,
  };
};