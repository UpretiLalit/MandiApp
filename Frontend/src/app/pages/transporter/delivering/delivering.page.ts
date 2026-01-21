import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';

declare var google: any;

interface DeliveryDetails {
  orderId: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  buyerLocation: {
    latitude: number;
    longitude: number;
  };
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
    vendorName: string;
  }>;
}

@Component({
  selector: 'app-delivering',
  templateUrl: './delivering.page.html',
  styleUrls: ['./delivering.page.scss'],
})
export class DeliveringPage implements OnInit, OnDestroy {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;

  orderId: string = '';
  delivery: DeliveryDetails | null = null;
  
  map: any;
  currentLocationMarker: any;
  buyerLocationMarker: any;
  directionsService: any;
  directionsRenderer: any;
  
  currentLocation = { lat: 0, lng: 0 };
  distanceToBuyer: number = 0; // in meters
  estimatedTime: string = '15 min';
  isWithinRange: boolean = false; // true when within 100m
  
  watchId: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || '';
    // Load mock data immediately for testing
    this.loadDeliveryDetails();
  }

  ngOnDestroy() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }

  async loadDeliveryDetails() {
    // TODO: Replace with actual API call
    // const response = await this.orderService.getDeliveryDetails(this.orderId);
    
    // Mock data for testing
    this.delivery = {
      orderId: this.orderId,
      orderNumber: 'ORD-2026-001',
      buyerName: 'Rajesh Kumar',
      buyerPhone: '+91 98765 43210',
      deliveryAddress: '123, Green Market, Sector 18, Delhi - 110001',
      buyerLocation: {
        latitude: 28.6304,
        longitude: 77.2177
      },
      totalAmount: 2450,
      items: [
        { productName: 'Fresh Tomatoes', quantity: 10, vendorName: 'Fresh Farms' },
        { productName: 'Red Onions', quantity: 5, vendorName: 'Fresh Farms' },
        { productName: 'Potatoes', quantity: 8, vendorName: 'Veggie World' },
        { productName: 'Carrots', quantity: 6, vendorName: 'Green Valley' },
        { productName: 'Cabbage', quantity: 4, vendorName: 'Green Valley' }
      ]
    };

    // Initialize map and start tracking
    setTimeout(() => {
      this.initializeMap();
      this.startLocationTracking();
    }, 100);
  }

  async initializeMap() {
    try {
      // Get current location
      const position = await Geolocation.getCurrentPosition();
      this.currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Initialize Google Maps
      const mapOptions = {
        center: this.currentLocation,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      // Add current location marker (blue)
      this.currentLocationMarker = new google.maps.Marker({
        position: this.currentLocation,
        map: this.map,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      });

      // Add buyer location marker (red)
      const buyerLatLng = {
        lat: this.delivery!.buyerLocation.latitude,
        lng: this.delivery!.buyerLocation.longitude
      };

      this.buyerLocationMarker = new google.maps.Marker({
        position: buyerLatLng,
        map: this.map,
        title: 'Buyer Location',
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#EA4335',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 180
        }
      });

      // Initialize directions service
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: true, // We're using custom markers
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });

      // Calculate and display route
      this.calculateRoute();

    } catch (error) {
      console.error('Error initializing map:', error);
      const toast = await this.toastController.create({
        message: 'Failed to load map. Please check location permissions.',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    }
  }

  calculateRoute() {
    const request = {
      origin: this.currentLocation,
      destination: {
        lat: this.delivery!.buyerLocation.latitude,
        lng: this.delivery!.buyerLocation.longitude
      },
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.directionsService.route(request, (result: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsRenderer.setDirections(result);
        
        // Extract distance and duration
        const route = result.routes[0].legs[0];
        this.distanceToBuyer = route.distance.value; // in meters
        this.estimatedTime = route.duration.text;
        
        // Check if within 100m range
        this.checkProximity();
      } else {
        console.error('Directions request failed:', status);
      }
    });
  }

  async startLocationTracking() {
    try {
      this.watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
        (position) => {
          if (position) {
            this.currentLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            // Update current location marker
            if (this.currentLocationMarker) {
              this.currentLocationMarker.setPosition(this.currentLocation);
            }

            // Recalculate distance
            this.calculateDistance();
            this.checkProximity();
          }
        }
      );
    } catch (error) {
      console.error('Error tracking location:', error);
    }
  }

  calculateDistance() {
    if (!this.delivery) return;

    const R = 6371e3; // Earth radius in meters
    const φ1 = this.currentLocation.lat * Math.PI / 180;
    const φ2 = this.delivery.buyerLocation.latitude * Math.PI / 180;
    const Δφ = (this.delivery.buyerLocation.latitude - this.currentLocation.lat) * Math.PI / 180;
    const Δλ = (this.delivery.buyerLocation.longitude - this.currentLocation.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    this.distanceToBuyer = R * c; // Distance in meters
  }

  checkProximity() {
    const wasWithinRange = this.isWithinRange;
    this.isWithinRange = this.distanceToBuyer <= 100;

    // Show toast when entering 100m range
    if (!wasWithinRange && this.isWithinRange) {
      this.showArrivedNotification();
    }
  }

  async showArrivedNotification() {
    const toast = await this.toastController.create({
      message: '🎯 You are within 100m of delivery location!',
      duration: 4000,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }

  async callBuyer() {
    const alert = await this.alertController.create({
      header: 'Call Buyer',
      message: `Do you want to call ${this.delivery?.buyerName}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Call',
          handler: () => {
            // Open phone dialer
            window.open(`tel:${this.delivery?.buyerPhone}`, '_system');
          }
        }
      ]
    });

    await alert.present();
  }

  async markArrived() {
    if (!this.isWithinRange) {
      const toast = await this.toastController.create({
        message: 'You must be within 100m to mark as arrived',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm Arrival',
      message: 'Have you arrived at the delivery location?',
      buttons: [
        {
          text: 'Not Yet',
          role: 'cancel'
        },
        {
          text: 'Yes, Arrived',
          handler: async () => {
            // TODO: Call API to update order status
            // await this.orderService.markArrived(this.orderId);

            const toast = await this.toastController.create({
              message: '✅ Marked as arrived! Proceed with delivery.',
              duration: 2000,
              color: 'success'
            });
            toast.present();

            // Navigate to delivery confirmation page
            setTimeout(() => {
              this.router.navigate(['/transporter/confirm-delivery', this.orderId]);
            }, 2000);
          }
        }
      ]
    });

    await alert.present();
  }

  getDistanceText(): string {
    if (this.distanceToBuyer < 1000) {
      return `${Math.round(this.distanceToBuyer)} m`;
    } else {
      return `${(this.distanceToBuyer / 1000).toFixed(1)} km`;
    }
  }

  goBack() {
    this.router.navigate(['/transporter/dashboard']);
  }
}
