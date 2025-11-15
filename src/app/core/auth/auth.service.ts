import { inject, Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, RedirectRequest, SilentRequest } from '@azure/msal-browser';
import { Observable, from, map, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _msal = inject(MsalService);
    private _scopes = [
        'openid',
        'profile',
        'offline_access',
        'api://dc02d6fb-755a-41b3-9bb7-ffa3acb35271/Orders.Modify',
        'api://dc02d6fb-755a-41b3-9bb7-ffa3acb35271/Files.Read',
    ];

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Initiates login using redirect flow with provided scopes/state
     */
    login(redirectUrl?: string, scopes?: string[]): void {
        const request: RedirectRequest = {
            scopes: scopes ?? this._scopes,
            state: redirectUrl ? encodeURIComponent(redirectUrl) : undefined,
        };
        this._msal.loginRedirect(request);
    }

    /**
     * Logout via redirect. Clears local cache and returns to sign-out page.
     * Passing the logout endpoint as authority is incorrect and triggers CORS; use the policy authority.
     */
    signOut(options?: { redirectTo?: string }): Observable<void> {
        const postLogoutRedirectUri = options?.redirectTo ?? `${window.location.origin}/sign-out`;
        // Use configured authority (policy) from MSAL config. If overriding, provide the policy authority, NOT the logout URL.
        // Example policy authority: https://dyvenix.ciamlogin.com/1c3cdcca-ba60-4ad2-9892-626f5d92bc09/SignUpSignIn/v2.0
        this._msal.logoutRedirect({ postLogoutRedirectUri });
        return of(void 0);
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
    async acquireToken(): Promise<string> {
        const account = this._msal.instance.getActiveAccount()
            || this._msal.instance.getAllAccounts()[0];

        const silentRequest: SilentRequest = {
            account,
            scopes: this._scopes
        };

        const res = await this._msal.instance.acquireTokenSilent(silentRequest);
        return res.accessToken;
    }

}
