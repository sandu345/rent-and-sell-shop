import { Customer, Order, Notification } from '@/types/types';

export class NotificationService {
  // In a real app, this would be stored in a database
  private static notifications: Notification[] = [];
  private static listeners: Array<(notifications: Notification[]) => void> = [];

  static addListener(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback);
  }

  static removeListener(callback: (notifications: Notification[]) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  static createOrderPlacedNotification(customer: Customer, order: Order): Notification {
    const notification: Notification = {
      id: `notification_${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.contactNumber,
      orderId: order.id,
      type: 'order_placed',
      title: 'Order Confirmation',
      message: `Hi ${customer.name}! Your order #${order.id.slice(-8)} has been placed successfully. Courier date is ${new Date(order.courierDate).toLocaleDateString()}. Total is Rs. ${order.totalPrice}.`,
      status: 'pending',
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.notifications.push(notification);
    this.notifyListeners();
    
    // In a real app, you would send this immediately
    this.simulateSending(notification);
    
    return notification;
  }

  static createReturnReminderNotification(customer: Customer, order: Order): Notification {
    const returnDate = new Date(order.returnDate!);
    const notification: Notification = {
      id: `notification_${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.contactNumber,
      orderId: order.id,
      type: 'return_reminder',
      title: 'Return Reminder',
      message: `Hi ${customer.name}! This is a reminder that items from order #${order.id.slice(-8)} should be returned on or before ${returnDate.toLocaleDateString()}. Please ensure timely return to avoid any inconvenience.`,
      status: 'pending',
      scheduledFor: new Date(returnDate.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day before
      createdAt: new Date().toISOString()
    };

    this.notifications.push(notification);
    this.notifyListeners();
    
    return notification;
  }

  static createPaymentReminderNotification(customer: Customer, order: Order): Notification {
    const balance = order.totalPrice - order.paidAmount;
    const returnDate = new Date(order.returnDate!);
    
    const notification: Notification = {
      id: `notification_${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.contactNumber,
      orderId: order.id,
      type: 'payment_reminder',
      title: 'Payment Reminder',
      message: `Hi ${customer.name}! You have a pending balance of Rs. ${balance} for order #${order.id.slice(-8)}. Please complete the payment on or before the return date (${returnDate.toLocaleDateString()}).`,
      status: 'pending',
      scheduledFor: new Date(returnDate.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day before
      createdAt: new Date().toISOString()
    };

    this.notifications.push(notification);
    this.notifyListeners();
    
    return notification;
  }

  static createOverdueReminderNotification(customer: Customer, order: Order): Notification {
    const balance = order.totalPrice - order.paidAmount;
    const hasUnreturnedItems = order.items.some(item => !item.isReturned);
    
    let message = `Hi ${customer.name}! `;
    
    if (hasUnreturnedItems && balance > 0) {
      message += `Order #${order.id.slice(-8)} is overdue. Please return the items and complete the payment of Rs. ${balance} immediately.`;
    } else if (hasUnreturnedItems) {
      message += `Order #${order.id.slice(-8)} return is overdue. Please return the items immediately.`;
    } else if (balance > 0) {
      message += `Payment for order #${order.id.slice(-8)} is overdue. Please pay Rs. ${balance} immediately.`;
    }

    const notification: Notification = {
      id: `notification_${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.contactNumber,
      orderId: order.id,
      type: 'overdue_reminder',
      title: 'Overdue Reminder',
      message,
      status: 'pending',
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.notifications.push(notification);
    this.notifyListeners();
    
    // Send immediately for overdue
    this.simulateSending(notification);
    
    return notification;
  }

  static createOrderCancelledNotification(customer: Customer, order: Order): Notification {
    const notification: Notification = {
      id: `notification_${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.contactNumber,
      orderId: order.id,
      type: 'order_cancelled',
      title: 'Order Cancelled',
      message: `Hi ${customer.name}! Your order #${order.id.slice(-8)} has been cancelled. If you have any questions, please contact us. Thank you for your understanding.`,
      status: 'pending',
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.notifications.push(notification);
    this.notifyListeners();
    
    // Send immediately for order cancellation
    this.simulateSending(notification);
    
    return notification;
  }

  private static async simulateSending(notification: Notification) {
    // Simulate API call delay
    setTimeout(() => {
      const index = this.notifications.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        this.notifications[index] = {
          ...notification,
          status: 'sent',
          sentAt: new Date().toISOString()
        };
        this.notifyListeners();
      }
    }, 1000);
  }

  static getNotifications(): Notification[] {
    return this.notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static getNotificationsByCustomer(customerId: string): Notification[] {
    return this.notifications.filter(n => n.customerId === customerId);
  }

  static checkForDueReminders(customers: Customer[], orders: Order[]) {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    orders.forEach(order => {
      if (order.isCancelled || order.type === 'sale') return;
      
      const customer = customers.find(c => c.id === order.customerId);
      if (!customer) return;
      
      const returnDate = new Date(order.returnDate!);
      const hasUnreturnedItems = order.items.some(item => !item.isReturned);
      const hasBalance = order.totalPrice - order.paidAmount > 0;
      
      // Check if return date is tomorrow - send reminders 1 day before
      if (returnDate.toDateString() === tomorrow.toDateString()) {
        // Only send return reminder if there are unreturned items
        if (hasUnreturnedItems) {
          const hasRecentReturnReminder = this.notifications.some(n => 
            n.orderId === order.id && 
            n.type === 'return_reminder' && 
            new Date(n.createdAt).toDateString() === today.toDateString()
          );
          
          if (!hasRecentReturnReminder) {
            this.createReturnReminderNotification(customer, order);
          }
        }
        
        // Only send payment reminder if there's a balance
        if (hasBalance) {
          const hasRecentPaymentReminder = this.notifications.some(n => 
            n.orderId === order.id && 
            n.type === 'payment_reminder' && 
            new Date(n.createdAt).toDateString() === today.toDateString()
          );
          
          if (!hasRecentPaymentReminder) {
            this.createPaymentReminderNotification(customer, order);
          }
        }
      }
      
      // Check if return date is overdue - send daily reminders
      if (returnDate < today && (hasUnreturnedItems || hasBalance)) {
        const hasRecentOverdueReminder = this.notifications.some(n => 
          n.orderId === order.id && 
          n.type === 'overdue_reminder' && 
          new Date(n.createdAt).toDateString() === today.toDateString()
        );
        
        if (!hasRecentOverdueReminder) {
          this.createOverdueReminderNotification(customer, order);
        }
      }
    });
  }

  static markAsSent(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications[index] = {
        ...this.notifications[index],
        status: 'sent',
        sentAt: new Date().toISOString()
      };
      this.notifyListeners();
    }
  }

  static markAsFailed(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications[index] = {
        ...this.notifications[index],
        status: 'failed'
      };
      this.notifyListeners();
    }
  }
}
