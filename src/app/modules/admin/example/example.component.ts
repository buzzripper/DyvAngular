import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector     : 'example',
    standalone   : true,
    templateUrl  : './example.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ExampleComponent
{
    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService
    )
    {
    }

    async ngOnInit() {
        const token = await this._authService.acquireToken();
        console.log(token);
    }
}
