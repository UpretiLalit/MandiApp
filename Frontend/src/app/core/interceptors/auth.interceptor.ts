import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }
        
        return next.handle(request).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !request.url.includes('/auth/')) {
              // Token expired or invalid - logout and redirect (but not for auth endpoints)
              this.authService.logout().then(() => {
                this.router.navigate(['/auth/login']);
              });
            }
            return throwError(() => error);
          })
        );
      })
    );
  }
}
