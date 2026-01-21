import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthResponse, OtpRequest, OtpVerification, RegisterRequest, User } from '../models/auth.model';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private async loadStoredUser() {
    const { value: token } = await Preferences.get({ key: this.TOKEN_KEY });
    const { value: userJson } = await Preferences.get({ key: this.USER_KEY });

    if (token && userJson) {
      const user = JSON.parse(userJson);
      this.currentUserSubject.next(user);
    }
  }

  sendOtp(request: OtpRequest): Observable<any> {
    return this.http.post(`${environment.identityApiUrl}/auth/send-otp`, request);
  }

  verifyOtp(request: OtpVerification): Observable<any> {
    return this.http.post(`${environment.identityApiUrl}/auth/verify-otp`, request).pipe(
      tap(async (response: any) => {
        if (response.token) {
          await this.saveAuthData(response.token, response.user);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.identityApiUrl}/auth/register`, request).pipe(
      tap(async (response) => {
        await this.saveAuthData(response.token, response.user);
      })
    );
  }

  private async saveAuthData(token: string, user: User) {
    await Preferences.set({ key: this.TOKEN_KEY, value: token });
    await Preferences.set({ key: this.USER_KEY, value: JSON.stringify(user) });
    this.currentUserSubject.next(user);
  }

  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.TOKEN_KEY });
    return value;
  }

  async logout() {
    await Preferences.remove({ key: this.TOKEN_KEY });
    await Preferences.remove({ key: this.USER_KEY });
    // Clear any other stored data
    await Preferences.clear();
    this.currentUserSubject.next(null);
    return true;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
