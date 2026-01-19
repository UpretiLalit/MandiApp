import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthService } from './auth.service';
import { LocationUpdate } from '../models/delivery.model';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private hubConnection?: signalR.HubConnection;
  private locationUpdates = new BehaviorSubject<LocationUpdate | null>(null);
  public locationUpdates$ = this.locationUpdates.asObservable();

  constructor(private authService: AuthService) {}

  async startConnection(): Promise<void> {
    const token = await this.authService.getToken();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.trackingHubUrl}?access_token=${token}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR Connected');
      this.registerHandlers();
    } catch (err) {
      console.error('Error connecting to SignalR:', err);
    }
  }

  private registerHandlers(): void {
    this.hubConnection?.on('LocationUpdate', (data: LocationUpdate) => {
      this.locationUpdates.next(data);
    });
  }

  async updateLocation(locationUpdate: LocationUpdate): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('UpdateLocation', locationUpdate);
    }
  }

  async subscribeToDelivery(deliveryId: number): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('SubscribeToDelivery', deliveryId);
    }
  }

  async unsubscribeFromDelivery(deliveryId: number): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('UnsubscribeFromDelivery', deliveryId);
    }
  }

  async stopConnection(): Promise<void> {
    await this.hubConnection?.stop();
  }
}
