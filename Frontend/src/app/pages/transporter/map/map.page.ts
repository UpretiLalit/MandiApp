import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController, LoadingController } from '@ionic/angular';
import { TrackingService } from '@core/services/tracking.service';
import { interval, Subscription } from 'rxjs';

interface Location {
  lat: number;
  lng: number;
}

interface VendorStop {
  vendorName: string;
  address: string;
  location: Location;
  itemCount: number;
  estimatedTime: string;
  distanceFromPrevious: number;
}

interface DeliveryRoute {
  id: number;
  orderNumber: string;
  status: string;
  vendorStops: VendorStop[];
  deliveryLocation: Location;
  pickupAddress: string;
  deliveryAddress: string;
  currentLocation?: Location;
  totalDistance: number;
  estimatedDuration: number;
  isOptimized: boolean;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, OnDestroy {
  delivery?: DeliveryRoute;
  currentLocation?: Location;
  isTracking: boolean = false;
  trackingSubscription?: Subscription;
  locationUpdateSubscription?: Subscription;
  
  // Map display properties
  mapCenter: Location = { lat: 23.0225, lng: 72.5714 }; // Gandhinagar
  markers: any[] = [];
  routePath: Location[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private trackingService: TrackingService
  ) {}

  ngOnInit() {
    const deliveryId = this.route.snapshot.queryParamMap.get('deliveryId');
    
    if (deliveryId) {
      this.loadDeliveryRoute(parseInt(deliveryId));
    }
    
    this.getCurrentLocation();
  }

  ngOnDestroy() {
    this.stopTracking();
  }

  async loadDeliveryRoute(deliveryId: number) {
    // Mock delivery data with multiple vendor stops - replace with actual API call
    this.delivery = {
      id: deliveryId,
      orderNumber: 'ORD-2024-001',
      status: 'InTransit',
      vendorStops: [
        {
          vendorName: 'Fresh Farms Co.',
          address: 'Shop 12, Mandi Yard A',
          location: { lat: 23.2156, lng: 72.6369 },
          itemCount: 15,
          estimatedTime: '10 mins',
          distanceFromPrevious: 0
        },
        {
          vendorName: 'Green Valley',
          address: 'Shop 45, Mandi Yard B',
          location: { lat: 23.2200, lng: 72.6400 },
          itemCount: 8,
          estimatedTime: '5 mins',
          distanceFromPrevious: 1.2
        },
        {
          vendorName: 'Organic Hub',
          address: 'Shop 78, Mandi Yard C',
          location: { lat: 23.2250, lng: 72.6450 },
          itemCount: 12,
          estimatedTime: '7 mins',
          distanceFromPrevious: 1.5
        }
      ],
      deliveryLocation: { lat: 23.0225, lng: 72.5714 },
      pickupAddress: 'Multiple Vendors (3 stops)',
      deliveryAddress: 'Restaurant ABC, Ahmedabad',
      totalDistance: 25.3,
      estimatedDuration: 45,
      isOptimized: true
    };
    
    // Set map markers for all vendor stops
    this.markers = [];
    
    // Add vendor stop markers with numbers
    this.delivery.vendorStops.forEach((stop, index) => {
      this.markers.push({
        position: stop.location,
        label: (index + 1).toString(),
        title: stop.vendorName,
        color: 'blue',
        icon: 'home-outline'
      });
    });
    
    // Add delivery location marker
    this.markers.push({
      position: this.delivery.deliveryLocation,
      label: 'D',
      title: 'Delivery Location',
      color: 'red',
      icon: 'location-outline'
    });
    
    // Center map on first vendor stop
    this.mapCenter = this.delivery.vendorStops[0].location;
    
    // Generate optimized route path through all stops
    this.routePath = this.generateOptimizedRoute();
  }
  
  generateOptimizedRoute(): Location[] {
    if (!this.delivery) return [];
    
    const path: Location[] = [];
    
    // Add all vendor stops in sequence
    this.delivery.vendorStops.forEach(stop => {
      path.push(stop.location);
    });
    
    // Add final delivery location
    path.push(this.delivery.deliveryLocation);
    
    return path;
  }
  
  async optimizeRoute() {
    if (!this.delivery) return;
    
    const loading = await this.loadingController.create({
      message: 'Optimizing route...',
      duration: 1500
    });
    await loading.present();
    
    // In a real app, call Google Maps Directions API or similar
    // For now, just simulate optimization by reversing order
    setTimeout(() => {
      if (this.delivery) {
        this.delivery.vendorStops.reverse();
        this.delivery.isOptimized = !this.delivery.isOptimized;
        
        // Recalculate distances
        for (let i = 1; i < this.delivery.vendorStops.length; i++) {
          const prev = this.delivery.vendorStops[i - 1].location;
          const curr = this.delivery.vendorStops[i].location;
          this.delivery.vendorStops[i].distanceFromPrevious = this.calculateDistance(prev, curr);
        }
        
        // Update markers and route
        this.loadDeliveryRoute(this.delivery.id);
      }
      loading.dismiss();
    }, 1500);
  }
  
  calculateDistance(loc1: Location, loc2: Location): number {
    // Haversine formula for distance in km
    const R = 6371;
    const dLat = this.toRad(loc2.lat - loc1.lat);
    const dLng = this.toRad(loc2.lng - loc1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(loc1.lat)) * Math.cos(this.toRad(loc2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }
  
  toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async getCurrentLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      // Add current location marker
      this.markers.push({
        position: this.currentLocation,
        label: 'You',
        title: 'Your Location',
        color: 'blue'
      });
      
    } catch (error) {
      console.error('Error getting location:', error);
      this.showLocationError();
    }
  }

  async startTracking() {
    if (this.isTracking) return;
    
    const loading = await this.loadingController.create({
      message: 'Starting GPS tracking...',
      duration: 1000
    });
    await loading.present();
    
    this.isTracking = true;
    
    // Connect to SignalR tracking hub
    if (this.delivery) {
      await this.trackingService.startConnection();
      await this.trackingService.subscribeToDelivery(this.delivery.id);
    }
    
    // Start periodic location updates (every 10 seconds)
    this.locationUpdateSubscription = interval(10000).subscribe(async () => {
      await this.updateLocation();
    });
    
    loading.dismiss();
  }

  async stopTracking() {
    this.isTracking = false;
    
    if (this.locationUpdateSubscription) {
      this.locationUpdateSubscription.unsubscribe();
    }
    
    if (this.trackingSubscription) {
      this.trackingSubscription.unsubscribe();
    }
    
    await this.trackingService.stopConnection();
  }

  async updateLocation() {
    if (!this.isTracking || !this.delivery) return;
    
    try {
      const position = await Geolocation.getCurrentPosition();
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      this.currentLocation = newLocation;
      
      // Update marker on map
      const currentMarkerIndex = this.markers.findIndex(m => m.label === 'You');
      if (currentMarkerIndex >= 0) {
        this.markers[currentMarkerIndex].position = newLocation;
      }
      
      // Send location to backend via SignalR
      await this.trackingService.updateLocation({
        deliveryId: this.delivery.id,
        latitude: newLocation.lat,
        longitude: newLocation.lng
      });
      
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }

  async showLocationError() {
    const alert = await this.alertController.create({
      header: 'Location Access Required',
      message: 'Please enable location services to track deliveries',
      buttons: ['OK']
    });
    await alert.present();
  }

  generateRoutePath(start: Location, end: Location): Location[] {
    // Simplified route generation - in reality, use Google Maps Directions API
    const path: Location[] = [];
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      path.push({
        lat: start.lat + (end.lat - start.lat) * ratio,
        lng: start.lng + (end.lng - start.lng) * ratio
      });
    }
    
    return path;
  }

  openNavigation() {
    if (!this.delivery || this.delivery.vendorStops.length === 0) return;
    
    // Navigate to first vendor stop or delivery location
    const nextStop = this.delivery.vendorStops[0];
    const lat = nextStop.location.lat;
    const lng = nextStop.location.lng;
    
    // Google Maps URL scheme with multiple waypoints
    let url = 'https://www.google.com/maps/dir/?api=1';
    
    // Add all vendor stops as waypoints
    const waypoints = this.delivery.vendorStops
      .map(stop => `${stop.location.lat},${stop.location.lng}`)
      .join('|');
    
    url += `&waypoints=${waypoints}`;
    url += `&destination=${this.delivery.deliveryLocation.lat},${this.delivery.deliveryLocation.lng}`;
    
    window.open(url, '_system');
  }
  
  navigateToStop(stop: VendorStop) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.location.lat},${stop.location.lng}`;
    window.open(url, '_system');
  }

  centerOnCurrentLocation() {
    if (this.currentLocation) {
      this.mapCenter = { ...this.currentLocation };
    }
  }

  async completeDelivery() {
    const alert = await this.alertController.create({
      header: 'Complete Delivery',
      message: 'Scan the buyer\'s QR code to complete delivery',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Scan QR',
          handler: () => {
            this.router.navigate(['/transporter/scan'], {
              queryParams: { 
                deliveryId: this.delivery?.id,
                type: 'delivery'
              }
            });
          }
        }
      ]
    });
    
    await alert.present();
  }
}
