// // hooks/useAccounts.ts
// import { useQuery } from '@tanstack/react-query';

// const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// const getToken = () => localStorage.getItem('authToken');

// const apiClient = async (endpoint: string) => {
//   const token = getToken();
//   const response = await fetch(`${API_BASE}/api${endpoint}`, {
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token && { Authorization: `Bearer ${token}` }),
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch data');
//   }

//   return response.json();
// };

// export const useAccountsSummary = () => {
//   return useQuery({
//     queryKey: ['accounts', 'summary'],
//     queryFn: () => apiClient('/accounts/summary'),
//     staleTime: 2 * 60 * 1000, // 2 minutes
//   });
// };

// export const useAccountsOrders = (period: string, page = 1, limit = 10) => {
//   return useQuery({
//     queryKey: ['accounts', 'orders', period, page, limit],
//     queryFn: () => apiClient(`/accounts/orders/${period}?page=${page}&limit=${limit}`),
//     enabled: !!period,
//     staleTime: 2 * 60 * 1000,
//   });
// };

// hooks/useAccounts.ts
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const getToken = () => localStorage.getItem('authToken');

const apiClient = async (endpoint: string) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
};

interface AccountSummary {
  revenue: number;
  expectedRevenue: number;
  pendingAmount: number;
  ordersCount: number;
  previousRevenue: number;
  growthPercentage: number;
}

interface AccountsSummary {
  daily: AccountSummary;
  weekly: AccountSummary;
  monthly: AccountSummary;
  yearly: AccountSummary;
}

export const useAccountsSummary = () => {
  const [summary, setSummary] = useState<AccountsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient('/accounts/summary');
      setSummary(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch summary';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return { summary, loading, error, refetch: fetchSummary };
};

export const useAccountsOrders = (period: string, page = 1, limit = 1000) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const fetchOrders = async () => {
    if (!period) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient(`/accounts/orders/${period}?page=${page}&limit=${limit}`);
      setOrders(data.orders);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [period, page, limit]);

  return { orders, loading, error, pagination, refetch: fetchOrders };
};

export const useAccountsCustomers = (period: string) => {
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerAccounts = async () => {
    if (!period) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient(`/accounts/customers/${period}`);
      setCustomerAccounts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customer accounts';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerAccounts();
  }, [period]);

  return { customerAccounts, loading, error, refetch: fetchCustomerAccounts };
};