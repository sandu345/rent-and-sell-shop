const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
  });
};

export const orderAPI = {
  createOrder: async (data: any) => {
    const res = await authFetch(`/api/orders`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  getOrders: async () => {
    const res = await authFetch(`/api/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json(); // { orders, totalPages, currentPage }
  },

  getCustomerOrders: async (customerId: string) => {
    const res = await authFetch(`/api/orders/customer/${customerId}`);
    if (!res.ok) throw new Error('Failed to fetch customer orders');
    return res.json();
  },

  getOrder: async (orderId: string) => {
    const res = await authFetch(`/api/orders/${orderId}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },

  updateOrder: async (orderId: string, data: any) => {
    const res = await authFetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },

  cancelOrder: async (orderId: string) => {
    return orderAPI.updateOrder(orderId, { isCancelled: true });
  },

  dispatchOrder: async (orderId: string) => {
    const res = await authFetch(`/api/orders/${orderId}/dispatch`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to dispatch order');
    return res.json();
  },

  payOrder: async (orderId: string, amount: number) => {
    const res = await authFetch(`/api/orders/${orderId}/pay`, {
      method: 'PATCH',
      body: JSON.stringify({ amount })
    });
    if (!res.ok) throw new Error('Failed to process payment');
    return res.json();
  },

  markItemReturned: async (orderId: string, itemIndex: number) => {
    const res = await authFetch(`/api/orders/${orderId}/item/${itemIndex}/return`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to mark item returned');
    return res.json();
  }
};
