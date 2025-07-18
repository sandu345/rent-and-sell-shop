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

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse it, consider it expired
  }
};

// Auto logout function
const handleAutoLogout = () => {
  removeToken();
  // Dispatch custom event for logout
  window.dispatchEvent(new CustomEvent('auth:logout'));
  // Redirect to login
  window.location.href = '/login';
};

const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

    // Check token expiration before making request
  if (token && isTokenExpired(token)) {
    handleAutoLogout();
    throw new Error('Session expired');
  }

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


// // Customer API
// export const customerAPI = {
//   // Get all customers with pagination and search
//   getCustomers: async (params: {
//     name?: string;
//     page?: number;
//     limit?: number;
//     sortBy?: string;
//     sortOrder?: 'asc' | 'desc';
//     hasIncompleteOrders?: boolean;
//   } = {}) => {
//     const queryParams = new URLSearchParams();
    
//     if (params.name) queryParams.append('name', params.name);
//     if (params.page) queryParams.append('page', params.page.toString());
//     if (params.limit) queryParams.append('limit', params.limit.toString());
//     if (params.sortBy) queryParams.append('sortBy', params.sortBy);
//     if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
//     if (params.hasIncompleteOrders) queryParams.append('hasIncompleteOrders', params.hasIncompleteOrders.toString());

//     return apiClient(`/customers?${queryParams.toString()}`);
//   },

//   // Search customers
//   searchCustomers: async (name: string = '') => {
//     return apiClient(`/customers/search?name=${encodeURIComponent(name)}`);
//   },

//   // Create new customer
//   createCustomer: async (customerData: {
//     name: string;
//     address: string;
//     contactNumber: string;
//   }) => {
//     return apiClient(`/customers`, {
//       method: 'POST',
//       body: JSON.stringify(customerData),
//     });
//   },

//   // Update customer
//   updateCustomer: async (id: string, customerData: {
//     name: string;
//     address: string;
//     contactNumber: string;
//   }) => {
//     return apiClient(`/customers/${id}`, {
//       method: 'PATCH',
//       body: JSON.stringify(customerData),
//     });
//   },

//   // Delete customer
//   deleteCustomer: async (id: string) => {
//     return apiClient(`/customers/${id}`, {
//       method: 'DELETE',
//     });
//   },
// };

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

  // Get single customer
  getCustomer: async (id: string) => {
    return apiClient(`/customers/${id}`);
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



// services/api.ts (add to existing file)

export interface Order {
  _id: string;
  customer: string; // Customer ID
  customerName: string;
  type: 'rent' | 'sale';
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  toBePaidAmount: number;
  depositAmount?: number;
  courierMethod: 'pickme' | 'byhand' | 'bus';
  weddingDate: string;
  courierDate: string;
  returnDate?: string;
  isDispatched: boolean;
  isCompleted: boolean;
  isDepositRefunded?: boolean;
  createdAt: string;
  dispatchedDate: string;
  depositRefundedDate?: string;
  isCancelled: boolean;
}



export interface OrderItem {
  _id: string;
  name: string;
  price: number;
  isReturned: boolean;
  returnedAt?: string;
}

export interface PaymentRecord {
  _id: string;
  amount: number;
  date: string;
  note: string;
}

// Orders API
export const orderAPI = {
  // Get all orders with filters and pagination
  getOrders: async (params: {
    orderType?: 'rent' | 'sale';
    paymentMethod?: 'pickme' | 'byhand' | 'bus';
    isCompleted?: boolean;
    placedDate?: string;
    weddingDate?: string;
    courierDate?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    return apiClient(`/orders?${queryParams.toString()}`);
  },

  // Get single order
  getOrder: async (id: string) => {
    return apiClient(`/orders/${id}`);
  },

  // Get orders by customer
  getOrdersByCustomer: async (customerId: string) => {
    return apiClient(`/orders/customer/${customerId}`);
  },

  // Create new order
  createOrder: async (orderData: {
    customer: string;
    customerName: string;
    orderType: 'rent' | 'sale';
    items: Array<{ name: string; price: number }>;
    totalAmount: number;
    paidAmount: number;
    depositAmount?: number;
    paymentMethod: 'pickme' | 'byhand' | 'bus';
    weddingDate: string;
    courierDate: string;
    returnDate?: string;
  }) => {
    return apiClient('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Update order
  updateOrder: async (id: string, orderData: Partial<Order>) => {
    return apiClient(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
  },

  // Add payment to order
  addPayment: async (id: string, amount: number) => {
    return apiClient(`/orders/${id}/pay`, {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    });
  },

  // Mark order as dispatched
  markDispatched: async (id: string) => {
    return apiClient(`/orders/${id}/dispatch`, {
      method: 'PATCH',
    });
  },

  // Mark item as returned
  markItemReturned: async (orderId: string, itemIndex: number) => {
    return apiClient(`/orders/${orderId}/item/${itemIndex}/return`, {
      method: 'PATCH',
    });
  },

  // Cancel order
  cancelOrder: async (id: string) => {
    return apiClient(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

export { getToken, setToken, removeToken };