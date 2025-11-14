import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap, filter, take, map } from 'rxjs';
import { MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const authService = inject(AuthService);
    const msalBroadcast = inject(MsalBroadcastService);

    // Wait until no interaction is in progress to avoid interaction_in_progress errors
    return msalBroadcast.inProgress$.pipe(
        filter((status) => status === InteractionStatus.None),
        take(1),
        switchMap(() => authService.check()),
        map((authenticated) => {
            if (!authenticated) {
                authService.login(state.url);
                return false;
            }
            return true;
        })
    );
};
