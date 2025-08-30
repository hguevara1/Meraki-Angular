// app/frontend/src/app/interceptors/mock-auth.interceptor.ts
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MockAuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Simular que agregamos el token para testing
    const mockToken = 'mock-jwt-token';

    if (mockToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${mockToken}`
        }
      });
    }

    return next.handle(request);
  }
}
