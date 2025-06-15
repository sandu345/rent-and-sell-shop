
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Search, Send, AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';
import { Notification } from '@/types/types';
import { NotificationService } from '@/services/notificationService';
import { toast } from '@/hooks/use-toast';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'order_placed' | 'return_reminder' | 'payment_reminder' | 'overdue_reminder'>('all');

  useEffect(() => {
    const updateNotifications = (newNotifications: Notification[]) => {
      setNotifications(newNotifications);
    };

    NotificationService.addListener(updateNotifications);
    setNotifications(NotificationService.getNotifications());

    return () => {
      NotificationService.removeListener(updateNotifications);
    };
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    const matchesType = filterType === 'all' || notification.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
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
      case 'return_reminder':
        return 'bg-orange-100 text-orange-800';
      case 'payment_reminder':
        return 'bg-purple-100 text-purple-800';
      case 'overdue_reminder':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order_placed':
        return 'Order Placed';
      case 'return_reminder':
        return 'Return Reminder';
      case 'payment_reminder':
        return 'Payment Reminder';
      case 'overdue_reminder':
        return 'Overdue Reminder';
      default:
        return type;
    }
  };

  const handleResendNotification = (notification: Notification) => {
    // In a real app, this would trigger the actual sending mechanism
    console.log('Resending notification:', notification);
    
    setTimeout(() => {
      NotificationService.markAsSent(notification.id);
      toast({
        title: "Notification Sent",
        description: `Notification resent to ${notification.customerName}`,
      });
    }, 1000);
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
            <SelectItem value="return_reminder">Return Reminder</SelectItem>
            <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
            <SelectItem value="overdue_reminder">Overdue Reminder</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredNotifications.length === 0 ? (
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
            <Card key={notification.id} className="hover:shadow-md transition-shadow">
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
                    <span className="font-medium">Customer:</span> {notification.customerName}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {notification.customerPhone}
                  </div>
                  {notification.orderId && (
                    <div>
                      <span className="font-medium">Order:</span> #{notification.orderId.slice(-8)}
                    </div>
                  )}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
