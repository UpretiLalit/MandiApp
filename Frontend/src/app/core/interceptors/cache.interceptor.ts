import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 60000; // 60 seconds
  private pendingRequests = new Map<string, Observable<HttpEvent<any>>>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    // Skip caching for specific URLs (auth, etc.)
    if (req.url.includes('/auth/') || req.url.includes('/cart/')) {
      return next.handle(req);
    }

    const cacheKey = req.urlWithParams;
    const now = Date.now();

    // Check cache first
    const cachedItem = this.cache.get(cacheKey);
    if (cachedItem && (now - cachedItem.timestamp) < this.CACHE_DURATION) {
      console.log('✅ Cache hit:', cacheKey);
      // Return from sessionStorage as well
      return of(new HttpResponse({ 
        body: cachedItem.data,
        status: 200,
        statusText: 'OK (Cached)'
      }));
    }

    // Check if request is already pending
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      console.log('🔄 Request already pending, sharing:', cacheKey);
      return pendingRequest;
    }

    // Make the request and cache it
    const shared$ = next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('💾 Caching response:', cacheKey);
          this.cache.set(cacheKey, { data: event.body, timestamp: now });
          
          // Also store in sessionStorage for persistence
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              data: event.body,
              timestamp: now
            }));
          } catch (e) {
            console.warn('SessionStorage full, clearing old cache');
            this.clearOldCache();
          }

          // Remove from pending
          this.pendingRequests.delete(cacheKey);
        }
      }),
      shareReplay(1)
    );

    // Store as pending
    this.pendingRequests.set(cacheKey, shared$);

    return shared$;
  }

  private clearOldCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.CACHE_DURATION) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      sessionStorage.removeItem(key);
    });
  }

  public clearCache(): void {
    this.cache.clear();
    sessionStorage.clear();
  }
}
