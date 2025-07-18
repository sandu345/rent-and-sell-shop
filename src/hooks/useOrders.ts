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
  // addPayment: (id: string, amount: number ,) => Promise<void>;
  addPayment: (id: string, amount: number, onSuccess?: () => void) => Promise<void>;

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

  // const addPayment = async (id: string, amount: number) => {
  //   try {
  //     // First, update the local state immediately for instant UI feedback
  //     setOrders(prevOrders => 
  //       prevOrders.map(order => 
  //         order._id === id 
  //           ? { ...order, paidAmount: order.paidAmount + amount }
  //           : order
  //       )
  //     );
  //     console.log('Local state updated for payment', id, amount);

  //     // Then make the API call
  //     await orderAPI.addPayment(id, amount);
      
  //     toast({
  //       title: 'Success',
  //       description: 'Payment recorded successfully',
  //     });
      
  //     // Optionally refresh from server to ensure data consistency
  //     // You can comment this out if you trust the local update
  //     await fetchOrders();
  //   } catch (err) {
  //     // If API call fails, revert the local state
  //     setOrders(prevOrders => 
  //       prevOrders.map(order => 
  //         order._id === id 
  //           ? { ...order, paidAmount: order.paidAmount - amount }
  //           : order
  //       )
  //     );
      
  //     const errorMessage = err instanceof Error ? err.message : 'Failed to record payment';
  //     toast({
  //       title: 'Error',
  //       description: errorMessage,
  //       variant: 'destructive',
  //     });
  //     throw err;
  //   }
  // };


  const addPayment = async (
  id: string,
  amount: number,
  onSuccess?: () => void
) => {
  try {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === id
          ? { ...order, paidAmount: order.paidAmount + amount }
          : order
      )
    );
    console.log('Local state updated for payment', id, amount);

    await orderAPI.addPayment(id, amount);

    toast({
      title: 'Success',
      description: 'Payment recorded successfully',
    });

    await fetchOrders();

    // ✅ Only call if everything above succeeded
    if (onSuccess) onSuccess();

  } catch (err) {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === id
          ? { ...order, paidAmount: order.paidAmount - amount }
          : order
      )
    );

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
      // Update local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === id 
            ? { ...order, isDispatched: true, dispatchedDate: new Date().toISOString() }
            : order
        )
      );

      await orderAPI.markDispatched(id);
      toast({
        title: 'Success',
        description: 'Order marked as dispatched',
      });
      
      // Refresh to ensure consistency
      await fetchOrders();
    } catch (err) {
      // Revert local state on error
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === id 
            ? { ...order, isDispatched: false, dispatchedDate: undefined }
            : order
        )
      );
      
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
      // Update local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? {
                ...order,
                items: order.items.map((item, index) => 
                  index === itemIndex 
                    ? { ...item, isReturned: !item.isReturned, returnedAt: !item.isReturned ? new Date().toISOString() : undefined }
                    : item
                )
              }
            : order
        )
      );

      await orderAPI.markItemReturned(orderId, itemIndex);
      toast({
        title: 'Success',
        description: 'Item marked as returned',
      });
      
      // Refresh to ensure consistency
      await fetchOrders();
    } catch (err) {
      // Revert local state on error
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? {
                ...order,
                items: order.items.map((item, index) => 
                  index === itemIndex 
                    ? { ...item, isReturned: !item.isReturned, returnedAt: item.isReturned ? new Date().toISOString() : undefined }
                    : item
                )
              }
            : order
        )
      );
      
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