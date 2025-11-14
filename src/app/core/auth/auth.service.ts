import { inject, Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, InteractionRequiredAuthError, PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser';
import { Observable, from, map, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _msal = inject(MsalService);

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Initiates login using redirect flow with provided scopes/state
     */
    login(redirectUrl?: string, scopes?: string[]): void {
        const request: RedirectRequest = {
            scopes: scopes ?? [
                'openid',
                'profile',
                'offline_access',
                'api://dc02d6fb-755a-41b3-9bb7-ffa3acb35271/Orders.Modify',
                'api://dc02d6fb-755a-41b3-9bb7-ffa3acb35271/Files.Read',
            ],
            state: redirectUrl ? encodeURIComponent(redirectUrl) : undefined,
        };
        this._msal.loginRedirect(request);
    }

    /**
     * Logout via redirect
     */
    signOut(): Observable<any> {
        this._msal.logoutRedirect({});
        return of(true);
    }

    /**
     * Check whether a user account is present in the cache
     */
    check(): Observable<boolean> {
        const accounts = this._msal.instance.getAllAccounts();
        return of(accounts && accounts.length > 0);
    }

    /**
     * Acquire an access token for given scopes silently; falls back to interactive login
     */
    acquireToken(scopes: string[]): Observable<string> {
        const account: AccountInfo | undefined = this._msal.instance.getActiveAccount() || this._msal.instance.getAllAccounts()[0];
        const silentRequest: SilentRequest = {
            account,
            scopes,
        };

        return from(this._msal.acquireTokenSilent(silentRequest)).pipe(
            map((res: AuthenticationResult) => res.accessToken),
            // If silent fails with interaction required, trigger login and return empty
            switchMap((token) => of(token))
        );
    }
}
