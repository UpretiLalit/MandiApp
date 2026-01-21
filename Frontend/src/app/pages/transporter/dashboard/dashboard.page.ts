import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '@app/core/services/order.service';

interface TransporterStats {
  todayEarnings: number;
  tripsCompleted: number;
  activeTrips: number;
}

interface JobAlert {
  id: number;
  pickupLocation: string;
  vendorCount: number;
  dropLocation: string;
  distance: number;
  payload: string;
  crateCount: number;
  weight: number;
  earning: number;
  pickupTime: string;
}

@Component({
  selector: 'app-transporter-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class TransporterDashboardPage implements OnInit, OnDestroy {
  isOnline: boolean = false;
  assignedMandi: string = 'Azadpur Mandi';
  
  stats: TransporterStats = {
    todayEarnings: 2450,
    tripsCompleted: 8,
    activeTrips: 0
  };

  // Job Alert
  showJobAlert: boolean = false;
  incomingJob: JobAlert | null = null;
  acceptSlideProgress: number = 0;

  // Polling
  private pollingInterval: any;
  
  // Mock mode for testing
  useMockData: boolean = true; // Set to false when backend is ready

  constructor(
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    // Start polling when page loads
    
    // Add global mouse listeners for slide gesture on desktop
    document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this));
    document.addEventListener('mouseup', this.onDocumentMouseUp.bind(this));
  }

  ngOnDestroy() {
    this.stopPolling();
    
    // Remove global listeners
    document.removeEventListener('mousemove', this.onDocumentMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onDocumentMouseUp.bind(this));
  }

  onDocumentMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.onSlideMove(event);
    }
  }

  onDocumentMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.onSlideEnd(event);
    }
  }

  toggleDuty() {
    this.isOnline = !this.isOnline;
    
    if (this.isOnline) {
      console.log('Transporter is now ONLINE');
      this.startPolling();
    } else {
      console.log('Transporter is now OFFLINE');
      this.stopPolling();
    }
  }

  startPolling() {
    // Poll for new jobs every 5 seconds
    this.checkForJobs();
    this.pollingInterval = setInterval(() => {
      this.checkForJobs();
    }, 5000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  checkForJobs() {
    if (!this.isOnline || this.showJobAlert) return;

    // If mock mode is enabled, show mock job immediately
    if (this.useMockData) {
      console.log('Using mock data for testing');
      setTimeout(() => {
        this.showMockJob();
      }, 2000); // Show job after 2 seconds
      return;
    }

    // Use API when backend is ready
    this.orderService.getTransporterJobs().subscribe({
      next: (jobs) => {
        if (jobs && jobs.length > 0) {
          // Show the first available job
          const job = jobs[0];
          this.showJobFromApi(job);
        }
      },
      error: (err) => {
        console.error('Error fetching transporter jobs:', err);
        // Fallback to mock job for testing
        this.showMockJob();
      }
    });
  }

  showMockJob() {
    // Mock job for testing the flow
    const mockJob = {
      id: 'ORD-2026-001',
      pickupLocation: 'Azadpur Mandi',
      vendorCount: 3,
      dropLocation: 'Green Market, Sector 18',
      distance: '4.2 km',
      payload: '15 crates',
      crateCount: 15,
      weight: '~300 kg',
      earning: 350,
      pickupTime: new Date().toISOString()
    };
    
    this.showJobFromApi(mockJob);
  }

  showJobFromApi(apiJob: any) {
    // Play alarm sound
    this.playAlertSound();
    
    this.incomingJob = {
      id: apiJob.id,
      pickupLocation: apiJob.pickupLocation,
      vendorCount: apiJob.vendorCount,
      dropLocation: apiJob.dropLocation,
      distance: apiJob.distance,
      payload: apiJob.payload,
      crateCount: apiJob.crateCount,
      weight: apiJob.weight,
      earning: apiJob.earning,
      pickupTime: apiJob.pickupTime
    };

    this.showJobAlert = true;
  }

  playAlertSound() {
    // In real app, play notification sound
    console.log('🔔 RING RING - New Job Alert!');
  }

  private isDragging = false;
  private slideTrackWidth = 0;
  private startX = 0;

  onSlideStart(event: any) {
    this.isDragging = true;
    this.acceptSlideProgress = 0;
    
    // Get initial position
    if (event.type.includes('touch')) {
      this.startX = event.touches[0].clientX;
    } else {
      this.startX = event.clientX;
    }
    
    // Get the slide track width
    const slideTrack = event.target.closest('.slide-to-accept')?.querySelector('.slide-track');
    if (slideTrack) {
      this.slideTrackWidth = slideTrack.offsetWidth;
    }
    
    event.preventDefault();
    event.stopPropagation();
  }

  onSlideMove(event: any) {
    if (!this.isDragging) return;

    let currentX: number;

    // Handle both touch and mouse events
    if (event.type.includes('touch')) {
      if (!event.touches || event.touches.length === 0) return;
      currentX = event.touches[0].clientX;
    } else {
      currentX = event.clientX;
    }

    // Calculate distance moved from start
    const distance = Math.max(0, currentX - this.startX);
    const maxDistance = this.slideTrackWidth - 60; // Subtract thumb width
    
    this.acceptSlideProgress = Math.min((distance / maxDistance) * 100, 100);
    
    event.preventDefault();
    event.stopPropagation();
  }

  onSlideEnd(event: any) {
    if (!this.isDragging) return;
    
    const wasDragging = this.isDragging;
    this.isDragging = false;
    
    console.log('Slide ended at:', this.acceptSlideProgress + '%');
    
    if (this.acceptSlideProgress >= 80) {
      console.log('Job accepted via slide!');
      this.acceptJob();
    } else {
      // Reset slide with animation
      setTimeout(() => {
        this.acceptSlideProgress = 0;
      }, 100);
    }
    
    event.preventDefault();
    event.stopPropagation();
  }

  acceptJob() {
    if (!this.incomingJob) return;

    console.log('Job accepted!', this.incomingJob);
    
    // If mock mode, skip API call
    if (this.useMockData) {
      this.handleJobAcceptance();
      return;
    }
    
    // Call backend API to accept job
    this.orderService.acceptTransporterJob(this.incomingJob.id).subscribe({
      next: (response) => {
        console.log('Job accepted successfully:', response);
        this.handleJobAcceptance();
      },
      error: (err) => {
        console.error('Error accepting job:', err);
        // Still proceed in mock mode
        this.handleJobAcceptance();
      }
    });
  }

  handleJobAcceptance() {
    const acceptedJobId = this.incomingJob!.id;
    
    this.showJobAlert = false;
    this.stats.activeTrips++;
    this.acceptSlideProgress = 0;
    this.isDragging = false;
    
    // Show success toast
    const toast = document.createElement('ion-toast');
    toast.message = `✅ Job accepted! Navigate to pickup location.`;
    toast.duration = 3000;
    toast.color = 'success';
    document.body.appendChild(toast);
    toast.present();
    
    // Navigate to active trip page
    setTimeout(() => {
      this.router.navigate(['/transporter/active-trip', acceptedJobId]);
    }, 1500);
  }

  rejectJob() {
    this.showJobAlert = false;
    this.incomingJob = null;
    this.acceptSlideProgress = 0;

    const toast = document.createElement('ion-toast');
    toast.message = '❌ Job rejected';
    toast.duration = 2000;
    toast.color = 'warning';
    document.body.appendChild(toast);
    toast.present();

    // Check for next job immediately
    setTimeout(() => {
      this.checkForJobs();
    }, 1000);
  }

  viewEarnings() {
    console.log('View earnings history');
  }

  viewTrips() {
    console.log('View trips history');
  }
}
