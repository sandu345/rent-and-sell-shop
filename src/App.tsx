import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/pages/Dashboard";
import { Customers } from "@/pages/Customers";
import { Orders } from "@/pages/Orders";
import { Accounts } from "@/pages/Accounts";
import { Notifications } from "@/pages/Notifications";
import { CustomerProfile } from "@/pages/CustomerProfile";
import { Customer, Order } from "@/types/types";
import { NotificationService } from "@/services/notificationService";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Check for due reminders every hour
  useEffect(() => {
    const checkReminders = () => {
      NotificationService.checkForDueReminders(customers, orders);
    };

    // Check immediately and then every hour
    checkReminders();
    const interval = setInterval(checkReminders, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [customers, orders]);

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

    // Send order placed notification
    const customer = customers.find(c => c.id === orderData.customerId);
    if (customer) {
      NotificationService.createOrderPlacedNotification(customer, newOrder);
      
      // Schedule return and payment reminders for rental orders
      if (newOrder.type === 'rent' && newOrder.returnDate) {
        NotificationService.createReturnReminderNotification(customer, newOrder);
        
        if (newOrder.totalPrice - newOrder.paidAmount > 0) {
          NotificationService.createPaymentReminderNotification(customer, newOrder);
        }
      }
    }
  };

  const handleEditOrder = (id: string, orderData: Omit<Order, 'id' | 'createdAt'>) => {
    setOrders(orders.map(order => 
      order.id === id 
        ? { ...order, ...orderData }
        : order
    ));
  };

  const handleCancelOrder = (id: string) => {
    const order = orders.find(o => o.id === id);
    const customer = order ? customers.find(c => c.id === order.customerId) : null;
    
    setOrders(orders.map(order => 
      order.id === id 
        ? { ...order, isCancelled: true, cancelledDate: new Date().toISOString() }
        : order
    ));

    // Send cancellation notification
    if (order && customer) {
      NotificationService.createOrderCancelledNotification(customer, order);
    }
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
                  <Route path="/notifications" element={<Notifications />} />
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
