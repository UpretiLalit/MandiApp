import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface PriceUpdateEvent {
  productId: string;
  vendorId: string;
  newPrice: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | null = null;
  private priceUpdateSubject = new BehaviorSubject<PriceUpdateEvent | null>(null);
  public priceUpdate$: Observable<PriceUpdateEvent | null> = this.priceUpdateSubject.asObservable();
  
  private connectionState = new BehaviorSubject<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  );
  public connectionState$ = this.connectionState.asObservable();

  constructor() {}

  public startConnection(hubUrl?: string): Promise<void> {
    // Use provided URL or fall back to environment config or localhost
    const url = hubUrl || (environment as any).priceHubUrl || 'http://localhost:5002/hubs/price';
    
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR already connected');
      return Promise.resolve();
    }

    console.log('Connecting to SignalR Hub:', url);

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Register event handlers
    this.registerEventHandlers();

    return this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connected successfully');
        this.connectionState.next(this.hubConnection!.state);
      })
      .catch(err => {
        console.error('Error starting SignalR connection:', err);
        this.connectionState.next(signalR.HubConnectionState.Disconnected);
        throw err;
      });
  }

  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    // Listen for price updates
    this.hubConnection.on('PriceUpdated', (data: PriceUpdateEvent) => {
      console.log('Price update received:', data);
      this.priceUpdateSubject.next(data);
    });

    // Connection state handlers
    this.hubConnection.onreconnecting((error) => {
      console.log('SignalR Reconnecting...', error);
      this.connectionState.next(signalR.HubConnectionState.Reconnecting);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('SignalR Reconnected:', connectionId);
      this.connectionState.next(signalR.HubConnectionState.Connected);
    });

    this.hubConnection.onclose((error) => {
      console.log('SignalR Connection closed', error);
      this.connectionState.next(signalR.HubConnectionState.Disconnected);
    });
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      console.log('SignalR Connection stopped');
      this.connectionState.next(signalR.HubConnectionState.Disconnected);
    }
  }

  // Join a specific product room for targeted updates
  public async joinProductRoom(productId: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('JoinProductRoom', productId);
        console.log(`Joined product room: ${productId}`);
      } catch (err) {
        console.error('Error joining product room:', err);
      }
    }
  }

  // Leave a product room
  public async leaveProductRoom(productId: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('LeaveProductRoom', productId);
        console.log(`Left product room: ${productId}`);
      } catch (err) {
        console.error('Error leaving product room:', err);
      }
    }
  }

  // Send price update (for vendor app)
  public async updatePrice(productId: string, vendorId: string, newPrice: number): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('UpdatePrice', productId, vendorId, newPrice);
        console.log(`Price updated: ${productId} - ${newPrice}`);
      } catch (err) {
        console.error('Error updating price:', err);
      }
    }
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
}
