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
        this._authService.signOut().subscribe();
    }
}
