import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';
import type { CreateUserRequest, UpdateUserRequest } from '../../../core/services/user.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedTab: 'all' | 'buyer' | 'vendor' | 'transporter' = 'all';
  selectedNavTab: string = 'users';
  searchQuery: string = '';
  isLoading: boolean = false;
  
  // Sorting
  sortColumn: string = 'fullName';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Advanced filters
  filterByMandi: string = '';
  filterByStatus: string = '';
  availableMandis: { id: string; name: string; }[] = [];
  
  showUserForm: boolean = false;
  editingUser: User | null = null;
  
  userForm = {
    fullName: '',
    phoneNumber: '',
    email: '' as string | undefined,
    role: 'Buyer' as 'Buyer' | 'Vendor' | 'Transporter',
    
    // Mandi Assignment (cannot be changed after creation)
    assignedMandiId: '',
    assignedMandiName: '',
    
    // Address fields
    address: '',
    landmark: '',
    latitude: null as number | null,
    longitude: null as number | null,
    nearbyPlaces: [] as string[],
    
    // Buyer fields
    businessName: '',
    businessType: 'Restaurant' as string,
    
    // Vendor fields
    stallNumber: '',
    mandiLocation: '',
    categories: [] as string[],
    
    // Transporter fields
    vehicleType: '',
    vehicleNumber: '',
    vehicleCapacity: '',
    licenseNumber: ''
  };
  
  newCategory: string = '';
  newNearbyPlace: string = '';
  isPickingLocation: boolean = false;
  
  businessTypes = [
    'Restaurant',
    'Hotel',
    'Cloud Kitchen',
    'Retailer',
    'Caterer',
    'Other'
  ];
  
  vehicleTypes = [
    'Tempo (Mini Truck)',
    'Pick-up Truck',
    'Van',
    'Mini Van',
    'Two Wheeler',
    'Three Wheeler'
  ];
  
  useMockData: boolean = false; // Set to true for testing without backend

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Initialize available mandis
    this.availableMandis = [
      { id: 'mandi-001', name: 'Azadpur Mandi, Delhi' },
      { id: 'mandi-002', name: 'Mumbai APMC, Vashi' },
      { id: 'mandi-003', name: 'Bangalore APMC, Yeshwanthpur' },
      { id: 'mandi-004', name: 'Okhla Mandi, Delhi' },
      { id: 'mandi-005', name: 'Ghazipur Mandi, Delhi' }
    ];
    
    this.loadUsers();
  }
  
  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }
  
  applySorting() {
    this.filteredUsers.sort((a: any, b: any) => {
      let aVal = a[this.sortColumn];
      let bVal = b[this.sortColumn];
      
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  exportToExcel() {
    const dataToExport = this.filteredUsers.map(user => ({
      'Full Name': user.fullName,
      'Phone': user.phoneNumber,
      'Email': user.email || 'N/A',
      'Role': user.role,
      'Mandi': user.assignedMandiName,
      'Business Name': user.businessName || 'N/A',
      'Business Type': user.businessType || 'N/A',
      'Address': user.address || 'N/A',
      'Landmark': user.landmark || 'N/A',
      'Vehicle Type': user.vehicleType || 'N/A',
      'Vehicle Number': user.vehicleNumber || 'N/A',
      'License Number': user.licenseNumber || 'N/A',
      'Stall Number': user.stallNumber || 'N/A'
    }));
    
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `MandiApp_Users_${timestamp}.xlsx`);
    
    this.showToast(`Exported ${this.filteredUsers.length} users to Excel`, 'success');
  }

  loadUsers() {
    console.log('Loading users... useMockData:', this.useMockData);
    this.isLoading = true;
    
    if (this.useMockData) {
      this.users = [
        // Buyers
        {
          id: 'buyer-001',
          fullName: 'Raj Restaurant',
          phoneNumber: '+91 98765 43210',
          email: 'raj@restaurant.com',
          role: 'Buyer',
          assignedMandiId: 'mandi-001',
          assignedMandiName: 'Azadpur Mandi, Delhi',
          businessName: 'Raj Multi-Cuisine',
          businessType: 'Restaurant',
          address: '123 Main Road, Connaught Place, New Delhi - 110001',
          landmark: 'Near Rajiv Chowk Metro Station',
          latitude: 28.6315,
          longitude: 77.2167,
          nearbyPlaces: ['Rajiv Chowk Metro', 'Central Park', 'Palika Bazaar'],
          status: 'active',
          createdAt: new Date('2026-01-15'),
          lastActive: new Date('2026-01-20T08:30:00')
        },
        {
          id: 'buyer-002',
          fullName: 'Grand Hotel',
          phoneNumber: '+91 99887 76655',
          email: 'procurement@grandhotel.com',
          role: 'Buyer',
          assignedMandiId: 'mandi-004',
          assignedMandiName: 'Okhla Mandi, Delhi',
          businessName: 'Grand Hotel Delhi',
          businessType: 'Hotel',
          status: 'active',
          createdAt: new Date('2026-01-12'),
          lastActive: new Date('2026-01-19T14:20:00'),
          address: '45 MG Road, Karol Bagh, New Delhi - 110005',
          landmark: 'Near Karol Bagh Metro Station',
          latitude: 28.6519,
          longitude: 77.1900,
          nearbyPlaces: ['Karol Bagh Metro', 'Ajmal Khan Park', 'City Mall']
        },
        
        // Vendors
        {
          id: 'vendor-001',
          fullName: 'Rajesh Kumar',
          phoneNumber: '+91 98765 12345',
          email: 'rajesh@freshfarms.com',
          role: 'Vendor',
          assignedMandiId: 'mandi-001',
          assignedMandiName: 'Azadpur Mandi, Delhi',
          stallNumber: 'A-42',
          mandiLocation: 'Azadpur Mandi, Delhi',
          categories: ['Vegetables', 'Leafy Greens'],
          status: 'active',
          createdAt: new Date('2026-01-10'),
          lastActive: new Date('2026-01-20T09:00:00'),
          address: 'Stall A-42, Azadpur Mandi, Delhi - 110033',
          landmark: 'Near Gate 3, Azadpur Mandi',
          latitude: 28.7041,
          longitude: 77.1750,
          nearbyPlaces: ['Azadpur Metro', 'Mandi Gate 3', 'Cold Storage Unit']
        },
        {
          id: 'vendor-002',
          fullName: 'Priya Sharma',
          phoneNumber: '+91 87654 32109',
          email: 'priya@organicveggies.com',
          role: 'Vendor',
          assignedMandiId: 'mandi-002',
          assignedMandiName: 'Mumbai APMC, Vashi',
          stallNumber: 'B-15',
          mandiLocation: 'Mumbai APMC',
          categories: ['Vegetables', 'Organic'],
          status: 'active',
          createdAt: new Date('2026-01-08'),
          lastActive: new Date('2026-01-20T07:45:00'),
          address: 'Stall B-15, Mumbai APMC, Vashi, Navi Mumbai - 400703',
          landmark: 'Near Vashi Railway Station',
          latitude: 19.0760,
          longitude: 73.0097,
          nearbyPlaces: ['Vashi Station', 'APMC Market', 'Cold Storage']
        },
        
        // Transporters
        {
          id: 'transporter-001',
          fullName: 'Amit Singh',
          phoneNumber: '+91 99887 12345',
          email: 'amit@transport.com',
          role: 'Transporter',
          assignedMandiId: 'mandi-001',
          assignedMandiName: 'Azadpur Mandi, Delhi',
          vehicleType: 'Tempo (Mini Truck)',
          vehicleNumber: 'DL-1234-5678',
          vehicleCapacity: '500 kg',
          licenseNumber: 'DL-0120260012345',
          status: 'active',
          createdAt: new Date('2026-01-05'),
          lastActive: new Date('2026-01-20T10:15:00'),
          address: '78 Transport Nagar, Naraina, New Delhi - 110028',
          landmark: 'Near Naraina Industrial Area',
          latitude: 28.6261,
          longitude: 77.1389,
          nearbyPlaces: ['Naraina Metro', 'Transport Hub', 'Truck Service Center']
        },
        {
          id: 'transporter-002',
          fullName: 'Vijay Kumar',
          phoneNumber: '+91 88776 65544',
          email: 'vijay@logistics.com',
          role: 'Transporter',
          assignedMandiId: 'mandi-004',
          assignedMandiName: 'Okhla Mandi, Delhi',
          vehicleType: 'Pick-up Truck',
          vehicleNumber: 'MH-5678-9012',
          vehicleCapacity: '800 kg',
          licenseNumber: 'MH-0120260098765',
          status: 'active',
          createdAt: new Date('2026-01-03'),
          lastActive: new Date('2026-01-19T16:30:00'),
          address: '22 Ring Road, Lajpat Nagar, New Delhi - 110024',
          landmark: 'Near Lajpat Nagar Metro',
          latitude: 28.5677,
          longitude: 77.2431,
          nearbyPlaces: ['Lajpat Nagar Metro', 'Central Market', 'Parking Plaza']
        }
      ];
      this.isLoading = false;
    } else {
      // Load users from backend API
      console.log('Calling backend API: ${environment.apiUrl}/users');
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          console.log('Users loaded from backend:', users);
          this.users = users.map(u => ({
            ...u,
            createdAt: new Date(u.createdAt),
            lastActive: u.lastActive ? new Date(u.lastActive) : undefined
          }));
          this.filterUsers();
          this.isLoading = false;
          this.showToast(`Loaded ${users.length} users from server`, 'success');
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoading = false
          console.error('Error loading users:', error);
          this.showToast('Failed to load users from server. Check console for details.', 'danger');
        }
      });
    }
  }

  filterUsers() {
    let filtered = this.users;

    // Filter by role
    if (this.selectedTab !== 'all') {
      filtered = filtered.filter(user => 
        user.role.toLowerCase() === this.selectedTab
      );
    }

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(query) ||
        user.phoneNumber.includes(query) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.businessName && user.businessName.toLowerCase().includes(query)) ||
        (user.stallNumber && user.stallNumber.toLowerCase().includes(query)) ||
        (user.vehicleNumber && user.vehicleNumber.toLowerCase().includes(query))
      );
    }

    this.filteredUsers = filtered;
  }

  onTabChange(event: any) {
    this.selectedTab = event.detail.value;
    this.filterUsers();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value || '';
    this.filterUsers();
  }

  navigateToTab(event: any) {
    const tab = event.detail.value;
    const routes: Record<string, string> = {
      verification: '/admin/verification',
      hubs: '/admin/hubs',
      marketplace: '/admin/marketplace'
    };
    if (routes[tab]) {
      this.router.navigate([routes[tab]]);
    }
  }

  // ==================== USER FORM ====================

  openUserForm() {
    this.showUserForm = true;
    this.editingUser = null;
    this.resetForm();
  }

  closeUserForm() {
    this.showUserForm = false;
    this.editingUser = null;
  }

  resetForm() {
    this.userForm = {
      fullName: '',
      phoneNumber: '',
      email: '',
      role: 'Buyer',
      assignedMandiId: '',
      assignedMandiName: '',
      address: '',
      landmark: '',
      latitude: null,
      longitude: null,
      nearbyPlaces: [],
      businessName: '',
      businessType: 'Restaurant',
      stallNumber: '',
      mandiLocation: '',
      categories: [],
      vehicleType: '',
      vehicleNumber: '',
      vehicleCapacity: '',
      licenseNumber: ''
    };
  }

  addCategory() {
    if (this.newCategory.trim()) {
      this.userForm.categories.push(this.newCategory.trim());
      this.newCategory = '';
    }
  }

  removeCategory(index: number) {
    this.userForm.categories.splice(index, 1);
  }

  onMandiSelect() {
    // Update mandi name when mandi is selected
    const selectedMandi = this.availableMandis.find(m => m.id === this.userForm.assignedMandiId);
    this.userForm.assignedMandiName = selectedMandi ? selectedMandi.name : '';
  }

  async pickLocation() {
    this.isPickingLocation = true;
    
    // Get current location or use existing coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = this.userForm.latitude || position.coords.latitude;
          const lng = this.userForm.longitude || position.coords.longitude;
          
          // Open Google Maps picker
          this.openGoogleMapsPicker(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          this.showToast('Unable to get location. Using default.', 'warning');
          // Default to Delhi center
          this.openGoogleMapsPicker(28.6139, 77.2090);
        }
      );
    } else {
      this.showToast('Geolocation not supported', 'danger');
      this.isPickingLocation = false;
    }
  }

  openGoogleMapsPicker(lat: number, lng: number) {
    // In a real app, this would open a map modal
    // For now, we'll use a simple prompt simulation
    const useLocation = confirm(`Use location: ${lat.toFixed(6)}, ${lng.toFixed(6)}?\n\nIn production, this will open an interactive Google Map picker.`);
    
    if (useLocation) {
      this.userForm.latitude = lat;
      this.userForm.longitude = lng;
      
      // Reverse geocode to get address
      this.reverseGeocode(lat, lng);
      
      // Find nearby places
      this.findNearbyPlaces(lat, lng);
      
      this.showToast('✅ Location saved', 'success');
    }
    
    this.isPickingLocation = false;
  }

  async reverseGeocode(lat: number, lng: number) {
    // TODO: Call Google Maps Geocoding API
    // For now, generate a mock address
    const mockAddresses = [
      `${Math.floor(Math.random() * 999) + 1} Main Road, Connaught Place, New Delhi - 110001`,
      `Plot ${Math.floor(Math.random() * 50) + 1}, Sector ${Math.floor(Math.random() * 100) + 1}, Gurgaon - 122001`,
      `${Math.floor(Math.random() * 200) + 1} MG Road, Bangalore - 560001`
    ];
    this.userForm.address = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
  }

  async findNearbyPlaces(lat: number, lng: number) {
    // TODO: Call Google Places API
    // For now, generate mock nearby places
    const mockPlaces = [
      ['Metro Station', 'Shopping Mall', 'Central Park'],
      ['Bus Stop', 'Hospital', 'School'],
      ['Market', 'Temple', 'Bank']
    ];
    this.userForm.nearbyPlaces = mockPlaces[Math.floor(Math.random() * mockPlaces.length)];
  }

  addNearbyPlace() {
    if (this.newNearbyPlace.trim()) {
      this.userForm.nearbyPlaces.push(this.newNearbyPlace.trim());
      this.newNearbyPlace = '';
    }
  }

  removeNearbyPlace(index: number) {
    this.userForm.nearbyPlaces.splice(index, 1);
  }

  async saveUser() {
    // Validate common fields
    if (!this.userForm.fullName.trim()) {
      this.showToast('Please enter full name', 'warning');
      return;
    }
    if (!this.userForm.phoneNumber.trim()) {
      this.showToast('Please enter phone number', 'warning');
      return;
    }
    if (!this.userForm.assignedMandiId) {
      this.showToast('Please select a mandi', 'warning');
      return;
    }
    if (!this.userForm.address.trim() || !this.userForm.landmark.trim()) {
      this.showToast('Please enter address and landmark', 'warning');
      return;
    }
    if (this.userForm.latitude === null || this.userForm.longitude === null) {
      this.showToast('Please pick location on map', 'warning');
      return;
    }

    // Role-specific validation
    if (this.userForm.role === 'Buyer') {
      if (!this.userForm.businessName.trim()) {
        this.showToast('Please enter business name', 'warning');
        return;
      }
    } else if (this.userForm.role === 'Vendor') {
      if (!this.userForm.stallNumber.trim() || !this.userForm.mandiLocation.trim()) {
        this.showToast('Please enter stall number and mandi location', 'warning');
        return;
      }
    } else if (this.userForm.role === 'Transporter') {
      if (!this.userForm.vehicleNumber.trim() || !this.userForm.licenseNumber.trim()) {
        this.showToast('Please enter vehicle number and license number', 'warning');
        return;
      }
    }

    if (this.editingUser) {
      // Update existing user
      const index = this.users.findIndex(u => u.id === this.editingUser!.id);
      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          fullName: this.userForm.fullName,
          phoneNumber: this.userForm.phoneNumber,
          email: this.userForm.email,
          // Note: assignedMandiId cannot be changed after creation
          address: this.userForm.address,
          landmark: this.userForm.landmark,
          latitude: this.userForm.latitude!,
          longitude: this.userForm.longitude!,
          nearbyPlaces: [...this.userForm.nearbyPlaces],
          businessName: this.userForm.businessName,
          businessType: this.userForm.businessType,
          stallNumber: this.userForm.stallNumber,
          mandiLocation: this.userForm.mandiLocation,
          categories: [...this.userForm.categories],
          vehicleType: this.userForm.vehicleType,
          vehicleNumber: this.userForm.vehicleNumber,
          vehicleCapacity: this.userForm.vehicleCapacity,
          licenseNumber: this.userForm.licenseNumber
        };
        
        if (this.useMockData) {
          // Mock: Update local array
          this.showToast(`✅ ${this.userForm.fullName} updated`, 'success');
        } else {
          // Call backend API to update user
          const updateData: UpdateUserRequest = {
            fullName: this.userForm.fullName,
            phoneNumber: this.userForm.phoneNumber,
            email: this.userForm.email,
            address: this.userForm.address,
            landmark: this.userForm.landmark,
            latitude: this.userForm.latitude!,
            longitude: this.userForm.longitude!,
            nearbyPlaces: [...this.userForm.nearbyPlaces],
            businessName: this.userForm.businessName,
            businessType: this.userForm.businessType,
            stallNumber: this.userForm.stallNumber,
            mandiLocation: this.userForm.mandiLocation,
            categories: [...this.userForm.categories],
            vehicleType: this.userForm.vehicleType,
            vehicleNumber: this.userForm.vehicleNumber,
            vehicleCapacity: this.userForm.vehicleCapacity,
            licenseNumber: this.userForm.licenseNumber
          };

          this.userService.updateUser(this.editingUser.id, updateData).subscribe({
            next: (updatedUser) => {
              this.users[index] = {
                ...updatedUser,
                createdAt: new Date(updatedUser.createdAt),
                lastActive: updatedUser.lastActive ? new Date(updatedUser.lastActive) : undefined
              };
              this.filterUsers();
              this.showToast(`✅ ${this.userForm.fullName} updated`, 'success');
            },
            error: (error) => {
              console.error('Error updating user:', error);
              this.showToast('❌ Failed to update user', 'danger');
            }
          });
        }
      }
    } else {
      // Create new user
      console.log('📝 USER FORM DATA:', JSON.stringify(this.userForm, null, 2));
      
      const createData: CreateUserRequest = {
        fullName: this.userForm.fullName,
        phoneNumber: this.userForm.phoneNumber,
        email: this.userForm.email,
        role: this.userForm.role,
        assignedMandiId: this.userForm.assignedMandiId,
        assignedMandiName: this.userForm.assignedMandiName,
        address: this.userForm.address,
        landmark: this.userForm.landmark,
        latitude: this.userForm.latitude!,
        longitude: this.userForm.longitude!,
        nearbyPlaces: [...this.userForm.nearbyPlaces],
        businessName: this.userForm.businessName,
        businessType: this.userForm.businessType,
        stallNumber: this.userForm.stallNumber,
        mandiLocation: this.userForm.mandiLocation,
        categories: [...this.userForm.categories],
        vehicleType: this.userForm.vehicleType,
        vehicleNumber: this.userForm.vehicleNumber,
        vehicleCapacity: this.userForm.vehicleCapacity,
        licenseNumber: this.userForm.licenseNumber
      };
      
      console.log('🚀 CREATE USER PAYLOAD:', JSON.stringify(createData, null, 2));

      if (this.useMockData) {
        // Mock: Add to local array
        const newUser: User = {
          id: `${this.userForm.role.toLowerCase()}-${Date.now()}`,
          fullName: createData.fullName,
          phoneNumber: createData.phoneNumber,
          email: createData.email,
          role: createData.role as 'Buyer' | 'Vendor' | 'Transporter',
          assignedMandiId: createData.assignedMandiId,
          assignedMandiName: createData.assignedMandiName,
          address: createData.address,
          landmark: createData.landmark,
          latitude: createData.latitude,
          longitude: createData.longitude,
          nearbyPlaces: createData.nearbyPlaces,
          businessName: createData.businessName,
          businessType: createData.businessType,
          stallNumber: createData.stallNumber,
          mandiLocation: createData.mandiLocation,
          categories: createData.categories,
          vehicleType: createData.vehicleType,
          vehicleNumber: createData.vehicleNumber,
          vehicleCapacity: createData.vehicleCapacity,
          licenseNumber: createData.licenseNumber,
          status: 'active' as 'active',
          createdAt: new Date(),
          lastActive: new Date()
        };
        this.users.push(newUser);
        
        // IMPORTANT: Add to localStorage so user can login
        const storedUsers = localStorage.getItem('registered_users');
        const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
        registeredUsers.push({
          id: newUser.id,
          phoneNumber: newUser.phoneNumber,
          fullName: newUser.fullName,
          role: newUser.role,
          email: newUser.email,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
        console.log('✅ User added to localStorage for login. Total users:', registeredUsers.length);
        
        this.showToast(`✅ ${this.userForm.fullName} added as ${this.userForm.role}`, 'success');
      } else {
        // Call backend API to create user
        this.userService.createUser(createData).subscribe({
          next: (createdUser) => {
            this.users.push({
              ...createdUser,
              createdAt: new Date(createdUser.createdAt),
              lastActive: createdUser.lastActive ? new Date(createdUser.lastActive) : undefined
            });
            
            // IMPORTANT: Add to localStorage so user can login
            const storedUsers = localStorage.getItem('registered_users');
            const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
            registeredUsers.push({
              id: createdUser.id,
              phoneNumber: createdUser.phoneNumber,
              fullName: createdUser.fullName,
              role: createdUser.role,
              email: createdUser.email,
              createdAt: new Date().toISOString()
            });
            localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
            console.log('✅ User added to localStorage for login. Total users:', registeredUsers.length);
            
            this.filterUsers();
            this.showToast(`✅ ${this.userForm.fullName} added as ${this.userForm.role}`, 'success');
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.showToast('❌ Failed to create user', 'danger');
          }
        });
      }
    }

    this.filterUsers();
    this.closeUserForm();
  }

  editUser(user: User) {
    this.editingUser = user;
    this.userForm = {
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      assignedMandiId: user.assignedMandiId,
      assignedMandiName: user.assignedMandiName,
      address: user.address || '',
      landmark: user.landmark || '',
      latitude: user.latitude || null,
      longitude: user.longitude || null,
      nearbyPlaces: user.nearbyPlaces ? [...user.nearbyPlaces] : [],
      businessName: user.businessName || '',
      businessType: user.businessType || 'Restaurant',
      stallNumber: user.stallNumber || '',
      mandiLocation: user.mandiLocation || '',
      categories: user.categories ? [...user.categories] : [],
      vehicleType: user.vehicleType || '',
      vehicleNumber: user.vehicleNumber || '',
      vehicleCapacity: user.vehicleCapacity || '',
      licenseNumber: user.licenseNumber || ''
    };
    this.showUserForm = true;
  }

  async deleteUser(user: User) {
    const alert = await this.alertController.create({
      header: 'Delete User',
      message: `Are you sure you want to delete <strong>${user.fullName}</strong>? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (this.useMockData) {
              // Mock: Delete from local array
              this.users = this.users.filter(u => u.id !== user.id);
              this.filterUsers();
              this.showToast(`❌ ${user.fullName} deleted`, 'warning');
            } else {
              // Call backend API to delete user
              this.userService.deleteUser(user.id).subscribe({
                next: () => {
                  this.users = this.users.filter(u => u.id !== user.id);
                  this.filterUsers();
                  this.showToast(`❌ ${user.fullName} deleted`, 'warning');
                },
                error: (error) => {
                  console.error('Error deleting user:', error);
                  this.showToast('❌ Failed to delete user', 'danger');
                }
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async toggleUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    
    if (this.useMockData) {
      // Mock: Update local array
      user.status = newStatus;
      this.showToast(
        newStatus === 'active' ? `${user.fullName} activated` : `${user.fullName} suspended`,
        newStatus === 'active' ? 'success' : 'warning'
      );
    } else {
      // Call backend API to update status
      this.userService.updateUserStatus(user.id, newStatus).subscribe({
        next: () => {
          user.status = newStatus;
          this.showToast(
            newStatus === 'active' ? `${user.fullName} activated` : `${user.fullName} suspended`,
            newStatus === 'active' ? 'success' : 'warning'
          );
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          this.showToast('❌ Failed to update user status', 'danger');
        }
      });
    }
  }

  // ==================== UTILITIES ====================

  getUserCount(role: 'all' | 'buyer' | 'vendor' | 'transporter'): number {
    if (role === 'all') {
      return this.users.length;
    }
    return this.users.filter(u => u.role.toLowerCase() === role).length;
  }

  getActiveUsers(): number {
    return this.users.filter(u => u.status === 'active').length;
  }

  getSuspendedUsers(): number {
    return this.users.filter(u => u.status === 'suspended').length;
  }

  getRoleBadgeColor(role: string): string {
    const colors: Record<string, string> = {
      'Buyer': 'primary',
      'Vendor': 'success',
      'Transporter': 'warning'
    };
    return colors[role] || 'medium';
  }

  getStatusBadgeColor(status: string): string {
    const colors: Record<string, string> = {
      'active': 'success',
      'inactive': 'medium',
      'suspended': 'danger'
    };
    return colors[status] || 'medium';
  }

  getTimeSince(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }
}
