import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthResponse, OtpRequest, OtpVerification, RegisterRequest, User } from '../models/auth.model';
import { Preferences } from '@capacitor/preferences';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private _languageService?: LanguageService;

  constructor(
    private http: HttpClient,
    private injector: Injector
  ) {
    this.loadStoredUser();
  }

  private get languageService(): LanguageService {
    if (!this._languageService) {
      this._languageService = this.injector.get(LanguageService);
    }
    return this._languageService;
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
    
    // Extract and set language from JWT token
    this.extractAndSetLanguageFromToken(token);
  }

  /**
   * Extract language claim from JWT token and set it
   */
  private extractAndSetLanguageFromToken(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const languageClaim = payload.language || payload.Language;
      
      if (languageClaim) {
        this.languageService.setLanguageFromToken(languageClaim);
      }
    } catch (error) {
      console.error('Error extracting language from token:', error);
    }
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
