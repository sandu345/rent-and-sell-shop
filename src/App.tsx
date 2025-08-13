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
import { Login } from "@/pages/Login";
import { Settings } from "@/pages/Settings";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Navigation />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <div className="px-4 py-6 sm:px-0">
                        <Routes>
                          {/* Remove leading slashes from nested routes */}
                          <Route path="" element={<Dashboard />} />
                          <Route path="customers" element={<Customers />} />
                          <Route path="customers/:id" element={<CustomerProfile />} />
                          <Route path="orders" element={<Orders />} />
                          <Route path="accounts" element={<Accounts />} />
                          <Route path="notifications" element={<Notifications />} />
                          <Route path="settings" element={<Settings />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                    </main>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;