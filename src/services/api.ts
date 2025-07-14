// services/api.ts
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';


// Token management
const getToken = () => localStorage.getItem('authToken');
const setToken = (token: string) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');

// API client with authentication
// const apiClient = async (endpoint: string, options: RequestInit = {}) => {
//   const token = getToken();
  
//   const config: RequestInit = {
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token && { Authorization: `Bearer ${token}` }),
//       ...options.headers,
//     },
//     ...options,
//   };

//   const response = await fetch(`${API_BASE}/api${endpoint}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
//       });

//   if (!response.ok) {
//     if (response.status === 401) {
//       removeToken();
//       window.location.href = '/login';
//       throw new Error('Authentication failed');
//     }
    
//     const error = await response.json().catch(() => ({ msg: 'Network error' }));
//     throw new Error(error.msg || 'Something went wrong');
//   }
  
//   return response.json();
// };

const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}/api${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }

    const error = await response.json().catch(() => ({ msg: 'Network error' }));
    throw new Error(error.msg || 'Something went wrong');
  }

  return response.json();
};


// Customer API
export const customerAPI = {
  // Get all customers with pagination and search
  getCustomers: async (params: {
    name?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    hasIncompleteOrders?: boolean;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.name) queryParams.append('name', params.name);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.hasIncompleteOrders) queryParams.append('hasIncompleteOrders', params.hasIncompleteOrders.toString());

    return apiClient(`/customers?${queryParams.toString()}`);
  },

  // Search customers
  searchCustomers: async (name: string = '') => {
    return apiClient(`/customers/search?name=${encodeURIComponent(name)}`);
  },

  // Create new customer
  createCustomer: async (customerData: {
    name: string;
    address: string;
    contactNumber: string;
  }) => {
    return apiClient(`/customers`, {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  // Update customer
  updateCustomer: async (id: string, customerData: {
    name: string;
    address: string;
    contactNumber: string;
  }) => {
    return apiClient(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(customerData),
    });
  },

  // Delete customer
  deleteCustomer: async (id: string) => {
    return apiClient(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    return apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    removeToken();
  },

  getCurrentUser: async () => {
    return apiClient('/auth/me');
  },
};

export { getToken, setToken, removeToken };