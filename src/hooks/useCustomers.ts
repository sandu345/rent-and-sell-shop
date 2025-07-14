// hooks/useCustomers.ts
import { useState, useEffect, useCallback } from 'react';
import { customerAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export interface Customer {
  _id: string;
  name: string;
  address: string;
  contactNumber: string;
  createdAt: string;
}

interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refreshCustomers: () => void;
  addCustomer: (customerData: Omit<Customer, '_id' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, customerData: Omit<Customer, '_id' | 'createdAt'>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  goToPage: (page: number) => void;
    total: number;
}

export const useCustomers = (initialPage = 1, pageSize = 10): UseCustomersResult => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);


  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await customerAPI.getCustomers({
        name: searchTerm,
        page: currentPage,
        limit: pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      
      setCustomers(response.customers);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  const addCustomer = async (customerData: Omit<Customer, '_id' | 'createdAt'>) => {
    try {
      await customerAPI.createCustomer(customerData);
      toast({
        title: 'Success',
        description: 'Customer added successfully',
      });
      await fetchCustomers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add customer';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateCustomer = async (id: string, customerData: Omit<Customer, '_id' | 'createdAt'>) => {
    try {
      await customerAPI.updateCustomer(id, customerData);
      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });
      await fetchCustomers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customerAPI.deleteCustomer(id);
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
      await fetchCustomers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
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

  const refreshCustomers = () => {
    fetchCustomers();
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return {
    customers,
    loading,
    error,
    totalPages,
    currentPage,
    searchTerm,
    setSearchTerm,
    refreshCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    goToPage,
     total,
  };
};

// Hook for customer search (lightweight for dropdowns, etc.)
export const useCustomerSearch = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const searchCustomers = async (searchTerm: string) => {
    setLoading(true);
    try {
      const response = await customerAPI.searchCustomers(searchTerm);
      setCustomers(response);
    } catch (err) {
      console.error('Search failed:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    loading,
    searchCustomers,
  };
};