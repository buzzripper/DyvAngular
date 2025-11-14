import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult, InteractionRequiredAuthError, SilentRequest } from '@azure/msal-browser';
import { Observable, from, switchMap, catchError, of } from 'rxjs';

// Configure which resource URLs should receive an access token and which scopes to use
const PROTECTED_RESOURCE_MAP: Array<{ url: string; scopes: string[] }> = [
  // Example backend API base URL(s). Replace with your real API URL(s):
  // { url: 'https://api.your-domain.com/', scopes: [
  //   'api://dc02d6fb-755a-41b3-9bb7-ffa3acb35271/Orders.Modify',
  //   'api://dc02d6fb-755a-41b3-9bb7-ffa3acb35271/Files.Read',
  // ] },
];

export function msalAuthInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const msal = inject(MsalService);

  // Determine if request matches a protected resource
  const match = PROTECTED_RESOURCE_MAP.find((entry) => req.url.startsWith(entry.url));
  if (!match) {
    return next(req);
  }

  const account = msal.instance.getActiveAccount() || msal.instance.getAllAccounts()[0];
  if (!account) {
    // Not logged in; let it pass without token
    return next(req);
  }

  const silentRequest: SilentRequest = {
    account,
    scopes: match.scopes,
  };

  return from(msal.acquireTokenSilent(silentRequest)).pipe(
    switchMap((result: AuthenticationResult) => {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${result.accessToken}` },
      });
      return next(authReq);
    }),
    catchError((error) => {
      if (error instanceof InteractionRequiredAuthError) {
        // If interaction is required, proceed without token; route guards will trigger login.
        return next(req);
      }
      return next(req);
    })
  );
}
