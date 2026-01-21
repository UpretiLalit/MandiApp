import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: 'Buyer' | 'Vendor' | 'Transporter';
  status: 'active' | 'inactive' | 'suspended';
  
  // Mandi Assignment
  assignedMandiId: string;
  assignedMandiName: string;
  
  // Address
  address: string;
  landmark: string;
  latitude: number;
  longitude: number;
  nearbyPlaces?: string[];
  
  // Buyer specific
  businessName?: string;
  businessType?: string;
  
  // Vendor specific
  stallNumber?: string;
  mandiLocation?: string;
  categories?: string[];
  
  // Transporter specific
  vehicleType?: string;
  vehicleNumber?: string;
  vehicleCapacity?: string;
  licenseNumber?: string;
  
  createdAt: Date;
  lastActive?: Date;
}

export interface CreateUserRequest {
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: string;
  assignedMandiId: string;
  assignedMandiName: string;
  address: string;
  landmark: string;
  latitude: number;
  longitude: number;
  nearbyPlaces?: string[];
  businessName?: string;
  businessType?: string;
  stallNumber?: string;
  mandiLocation?: string;
  categories?: string[];
  vehicleType?: string;
  vehicleNumber?: string;
  vehicleCapacity?: string;
  licenseNumber?: string;
}

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  landmark: string;
  latitude: number;
  longitude: number;
  nearbyPlaces?: string[];
  businessName?: string;
  businessType?: string;
  stallNumber?: string;
  mandiLocation?: string;
  categories?: string[];
  vehicleType?: string;
  vehicleNumber?: string;
  vehicleCapacity?: string;
  licenseNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users with optional filters
   */
  getAllUsers(role?: string, mandiId?: string): Observable<User[]> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }
    if (mandiId) {
      params = params.set('mandiId', mandiId);
    }
    
    return this.http.get<User[]>(this.apiUrl, { params });
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new user
   * Note: assignedMandiId cannot be changed after creation
   */
  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * Update existing user
   * Note: role and assignedMandiId cannot be changed
   */
  updateUser(id: string, user: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update user status (active, inactive, suspended)
   */
  updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Get users by mandi (for filtering prices)
   */
  getUsersByMandi(mandiId: string): Observable<User[]> {
    return this.getAllUsers(undefined, mandiId);
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: 'Buyer' | 'Vendor' | 'Transporter'): Observable<User[]> {
    return this.getAllUsers(role);
  }
}
