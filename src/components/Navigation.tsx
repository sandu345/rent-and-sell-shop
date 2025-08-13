
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingBag, Calculator, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const Navigation: React.FC = () => {
  const { logout } = useAuth();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/orders', icon: Package, label: 'Orders' },
    { path: '/accounts', icon: Calculator, label: 'Accounts' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav style={{ backgroundColor: '#551820' }} className="shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <img src="src\Images\7e060565-2ecf-4f32-b077-daf6f71b9556.jpg" alt="Logo" className="h-10 w-10" />
                  <h1 className="text-xl font-bold text-white">සිරි කිරුළ</h1>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'border-blue-500 text-white'
                          : 'border-transparent text-white hover:text-gray-300 hover:border-gray-300'

                      }`
                    }
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-white hover:text-gray-300 hover:bg-white hover:bg-opacity-10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                   isActive
                    ? 'bg-white bg-opacity-10 border-blue-500 text-white'
                    : 'border-transparent text-white hover:text-gray-300 hover:bg-white hover:bg-opacity-10 hover:border-gray-300'

                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </NavLink>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-white hover:text-gray-300 hover:bg-white hover:bg-opacity-10 hover:border-gray-300 w-full text-left text-base font-medium transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
