import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

export interface NotificationEvent {
  type: 'order' | 'user' | 'system' | 'logistics';
  severity: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection: signalR.HubConnection | null = null;
  private notificationHistory: NotificationEvent[] = [];
  
  constructor(private toastController: ToastController) {
    this.connectToNotificationHub();
  }
  
  private async connectToNotificationHub() {
    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.logisticsHubUrl}/hubs/notifications`, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .build();
      
      // Listen for high-value orders
      this.hubConnection.on('HighValueOrder', (order: any) => {
        this.showNotification({
          type: 'order',
          severity: 'success',
          title: '💰 High-Value Order',
          message: `New order worth ₹${order.amount.toLocaleString()} from ${order.buyerName}`,
          timestamp: new Date(),
          data: order
        });
      });
      
      // Listen for system errors
      this.hubConnection.on('SystemError', (error: any) => {
        this.showNotification({
          type: 'system',
          severity: 'error',
          title: '⚠️ System Error',
          message: error.message,
          timestamp: new Date(),
          data: error
        });
      });
      
      // Listen for stuck orders
      this.hubConnection.on('OrderStuck', (order: any) => {
        this.showNotification({
          type: 'logistics',
          severity: 'warning',
          title: '🚨 Order Stuck',
          message: `Order #${order.id} hasn't moved in ${order.minutesStuck} minutes`,
          timestamp: new Date(),
          data: order
        });
      });
      
      // Listen for new user registrations
      this.hubConnection.on('NewUserRegistered', (user: any) => {
        this.showNotification({
          type: 'user',
          severity: 'info',
          title: '👤 New User',
          message: `${user.fullName} registered as ${user.role}`,
          timestamp: new Date(),
          data: user
        });
      });
      
      // Listen for payment failures
      this.hubConnection.on('PaymentFailed', (payment: any) => {
        this.showNotification({
          type: 'order',
          severity: 'error',
          title: '💳 Payment Failed',
          message: `Payment of ₹${payment.amount} failed for Order #${payment.orderId}`,
          timestamp: new Date(),
          data: payment
        });
      });
      
      // Listen for delivery completion
      this.hubConnection.on('OrderDelivered', (order: any) => {
        this.showNotification({
          type: 'logistics',
          severity: 'success',
          title: '✅ Order Delivered',
          message: `Order #${order.id} delivered to ${order.buyerName}`,
          timestamp: new Date(),
          data: order
        });
      });
      
      await this.hubConnection.start();
      console.log('✅ Connected to notification hub');
      
    } catch (error) {
      console.error('❌ Failed to connect to notification hub:', error);
      
      // Fallback: Generate mock notifications for demo
      this.startMockNotifications();
    }
  }
  
  private startMockNotifications() {
    // Simulate real-time notifications every 30 seconds for demo
    setInterval(() => {
      const mockEvents: NotificationEvent[] = [
        {
          type: 'order',
          severity: 'success',
          title: '💰 High-Value Order',
          message: `New order worth ₹${Math.floor(50000 + Math.random() * 150000).toLocaleString()} from Restaurant`,
          timestamp: new Date(),
        },
        {
          type: 'logistics',
          severity: 'warning',
          title: '🚨 Order Stuck',
          message: `Order #${Math.floor(1000 + Math.random() * 9000)} hasn't moved in ${Math.floor(30 + Math.random() * 45)} minutes`,
          timestamp: new Date(),
        },
        {
          type: 'user',
          severity: 'info',
          title: '👤 New User',
          message: `User registered as ${['Buyer', 'Vendor', 'Transporter'][Math.floor(Math.random() * 3)]}`,
          timestamp: new Date(),
        },
        {
          type: 'logistics',
          severity: 'success',
          title: '✅ Order Delivered',
          message: `Order #${Math.floor(1000 + Math.random() * 9000)} delivered successfully`,
          timestamp: new Date(),
        }
      ];
      
      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      this.showNotification(randomEvent);
    }, 30000); // Every 30 seconds
  }
  
  async showNotification(event: NotificationEvent) {
    // Add to history
    this.notificationHistory.unshift(event);
    if (this.notificationHistory.length > 100) {
      this.notificationHistory.pop();
    }
    
    // Determine toast color
    let color: string;
    switch (event.severity) {
      case 'success':
        color = 'success';
        break;
      case 'warning':
        color = 'warning';
        break;
      case 'error':
        color = 'danger';
        break;
      default:
        color = 'primary';
    }
    
    // Show toast
    const toast = await this.toastController.create({
      header: event.title,
      message: event.message,
      duration: event.severity === 'error' ? 5000 : 3000,
      color: color,
      position: 'top',
      buttons: [
        {
          text: 'View',
          handler: () => {
            // Could navigate to relevant page
            console.log('Notification clicked:', event);
          }
        },
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ],
      cssClass: 'notification-toast'
    });
    
    await toast.present();
    
    // Play sound for critical notifications
    if (event.severity === 'error' || event.severity === 'warning') {
      this.playNotificationSound();
    }
  }
  
  private playNotificationSound() {
    // Play a subtle notification sound
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2J0vLTgjMGHm7A7+OZSA4NVKzn77BdGAg+ltryxnMiBSl+zPDbkUAKFF+06uyoVRQKRp/g8r5sIQYtidLy04IzBh5uwO/jmUgODVSs5++wXRgIPpba8sZzIgUpfsz02pFAChRftOrsqFUUCkaf4PK+bCEGLYnS8tOCMwYebsDv45lIDg1UrOfvs10YCD6W2vLGcyIFKX7M9NqRQAoUX7Tq7KhVFApGn+DyvmwhBi2J0vLTgjMGHm7A7+OZSA4NVKzn77BdGAg+ltryxnMiBSl+zPTakUAKFF+06uyoVRQKRp/g8r5sIQYtidLy04IzBh5uwO/jmUgODVSs5++wXRgIPpba8sZzIgUpfsz02pFAChRftOrsqFUUCkaf4PK+bCEGLYnS8tOCMwYebsDv45lIDg1UrOfvsF0YCD6W2vLGcyIFKX7M9NqRQAoUX7Tq7KhVFApGn+DyvmwhBi2J0vLTgjMGHm7A7+OZSA4NVKzn77BdGAg+ltryxnMiBSl+zPTakUAKFF+06uyoVRQKRp/g8r5sIQYtidLy04IzBh5uwO/jmUgODVSs5++wXRgIPpba8sZzIgUpfsz02pFAChRftOrsqFUUCkaf4PK+bCEGLYnS8tOCMwYebsDv45lIDg1UrOfvsF0YCD6W2vLGcyIFKX7M9NqRQAoUX7Tq7KhVFApGn+DyvmwhBi2J0vLTgjMGHm7A7+OZSA4NVKzn77BdGAg+ltryxnMiBSl+zPTakUAKFF+06uyoVRQKRp/g8r5sIQYtidLy04IzBh5uwO/jmUgODVSs5++wXRgIPpba8sZzIgUpfsz02pFAChRftOrsqFUUCkaf4PK+bCEGLYnS8tOCMwYebsDv45lIDg1UrOfvsF0YCD6W2vLGcyIFKX7M9NqRQAoUX7Tq7KhVFApGn+DyvmwhBi2J0vLTgjMGHm7A7+OZSA4NVKzn77BdGAg+ltryxnMiBSl+zPTakUAKFF+06uyoVRQK';
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Could not play sound:', e));
  }
  
  getNotificationHistory(): NotificationEvent[] {
    return this.notificationHistory;
  }
  
  clearHistory() {
    this.notificationHistory = [];
  }
  
  disconnect() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
