import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/pages/Dashboard";
import { Customers } from "@/pages/Customers";
import { Orders } from "@/pages/Orders";
import { Accounts } from "@/pages/Accounts";
import { CustomerProfile } from "@/pages/CustomerProfile";
import { Customer, Order } from "@/types/types";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `customer_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCustomers([...customers, newCustomer]);
  };

  const handleEditCustomer = (id: string, customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    setCustomers(customers.map(customer => 
      customer.id === id 
        ? { ...customer, ...customerData }
        : customer
    ));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(customer => customer.id !== id));
    // Also remove all orders for this customer
    setOrders(orders.filter(order => order.customerId !== id));
  };

  const handleAddOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setOrders([...orders, newOrder]);
  };

  const handleEditOrder = (id: string, orderData: Omit<Order, 'id' | 'createdAt'>) => {
    setOrders(orders.map(order => 
      order.id === id 
        ? { ...order, ...orderData }
        : order
    ));
  };

  const handleCancelOrder = (id: string) => {
    setOrders(orders.map(order => 
      order.id === id 
        ? { ...order, isCancelled: true, cancelledDate: new Date().toISOString() }
        : order
    ));
  };

  const handleAddPayment = (order: Order) => {
    // This will be handled by the Orders component
    console.log('Add payment for order:', order.id);
  };

  const handleMarkDispatched = (order: Order) => {
    const updatedOrder = {
      ...order,
      isDispatched: true,
      dispatchedDate: new Date().toISOString()
    };

    const { id, createdAt, ...orderData } = updatedOrder;
    handleEditOrder(order.id, orderData);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <Routes>
                  <Route path="/" element={<Dashboard orders={orders} />} />
                  <Route 
                    path="/customers" 
                    element={
                      <Customers 
                        customers={customers} 
                        onAddCustomer={handleAddCustomer}
                        onEditCustomer={handleEditCustomer}
                        onDeleteCustomer={handleDeleteCustomer}
                      />
                    } 
                  />
                  <Route 
                    path="/customers/:customerId" 
                    element={
                      <CustomerProfile 
                        customers={customers}
                        orders={orders}
                        onEditCustomer={handleEditCustomer}
                        onEditOrder={handleEditOrder}
                        onAddPayment={handleAddPayment}
                        onMarkDispatched={handleMarkDispatched}
                        onDeleteCustomer={handleDeleteCustomer}
                        onCancelOrder={handleCancelOrder}
                      />
                    } 
                  />
                  <Route 
                    path="/orders" 
                    element={
                      <Orders 
                        customers={customers}
                        orders={orders}
                        onAddOrder={handleAddOrder}
                        onEditOrder={handleEditOrder}
                        onCancelOrder={handleCancelOrder}
                      />
                    } 
                  />
                  <Route 
                    path="/accounts" 
                    element={
                      <Accounts 
                        customers={customers}
                        orders={orders}
                      />
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
