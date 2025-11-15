import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-out',
    templateUrl: './sign-out.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterLink],
})
export class AuthSignOutComponent {
    constructor(private _authService: AuthService) {
        // After logout, remain on sign-out route instead of redirecting to Azure login
        //this._authService.signOut({ redirectTo: `${window.location.origin}/sign-out` }).subscribe();
    }
}
