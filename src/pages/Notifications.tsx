// Update pages/Notifications.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Search, Send, Clock, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { notificationAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Notification } from '@/types/types';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'order_placed' | 'order_cancelled' | 'payment_reminder' | 'return_reminder'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getNotifications({
        type: filterType === 'all' ? undefined : filterType,
        status: filterStatus === 'all' ? undefined : filterStatus,
        page: currentPage,
        limit: 20
      });
      
      setNotifications(response.notifications);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filterStatus, filterType]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order_placed':
        return 'bg-blue-100 text-blue-800';
      case 'order_cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'payment_reminder':
        return 'bg-purple-100 text-purple-800';
      case 'return_reminder':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order_placed':
        return 'Order Placed';
      case 'order_cancelled':
        return 'Order Cancelled';
      case 'payment_reminder':
        return 'Payment Reminder';
      case 'return_reminder':
        return 'Return Reminder';
      default:
        return type;
    }
  };

  const handleResendNotification = async (notification: Notification) => {
    try {
      await notificationAPI.resendNotification(notification._id);
      toast({
        title: "Notification Sent",
        description: `Notification resent to ${notification.customer.name}`,
      });
      fetchNotifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend notification",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredNotifications.length} notifications
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="order_placed">Order Placed</SelectItem>
            <SelectItem value="order_cancelled">Order Cancelled</SelectItem>
            <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
            <SelectItem value="return_reminder">Return Reminder</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading notifications...</div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'No notifications match your search criteria.' 
                : 'Notifications will appear here when orders are placed or reminders are due.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card key={notification._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(notification.status)}
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(notification.status)}>
                        {notification.status}
                      </Badge>
                      <Badge className={getTypeColor(notification.type)}>
                        {getTypeLabel(notification.type)}
                      </Badge>
                    </div>
                  </div>
                  {notification.status === 'failed' && (
                    <Button
                      size="sm"
                      onClick={() => handleResendNotification(notification)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Resend
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Customer:</span> {notification.customer.name}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {notification.phoneNumber}
                  </div>
                  <div>
                    <span className="font-medium">Order:</span> #{notification.order._id.slice(-8)}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{notification.message}</p>
                </div>

                {notification.sentAt && (
                  <div className="text-sm text-green-600">
                    <span className="font-medium">Sent:</span> {new Date(notification.sentAt).toLocaleString()}
                  </div>
                )}

                {notification.errorMessage && (
                  <div className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span><span className="font-medium">Error:</span> {notification.errorMessage}</span>
                  </div>
                )}

                {notification.twilioSid && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Twilio SID:</span> {notification.twilioSid}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};