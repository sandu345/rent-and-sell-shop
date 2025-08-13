import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// Layout component for protected routes
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {children}
      </div>
    </main>
  </div>
);

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
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard" 
                element={<Navigate to="/" replace />} 
              />
              
              <Route 
                path="/customers" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Customers />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/customers/:id" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CustomerProfile />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Orders />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/accounts" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Accounts />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Notifications />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;