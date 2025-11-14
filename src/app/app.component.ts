import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { Subject, filter, takeUntil, withLatestFrom } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
    private readonly _destroy$ = new Subject<void>();

    constructor(
        private _msalBroadcastService: MsalBroadcastService,
        private _msalService: MsalService,
        private _router: Router
    ) {}

    ngOnInit(): void {
        // Ensure an active account is set if present in cache
        const accounts = this._msalService.instance.getAllAccounts();
        if (accounts.length && !this._msalService.instance.getActiveAccount()) {
            this._msalService.instance.setActiveAccount(accounts[0]);
        }

        // On login success, wait until no interaction in progress then navigate
        this._msalBroadcastService.msalSubject$
            .pipe(
                filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
                withLatestFrom(this._msalBroadcastService.inProgress$),
                filter(([_, status]) => status === InteractionStatus.None),
                takeUntil(this._destroy$)
            )
            .subscribe(([msg]) => {
                const payload = (msg as EventMessage).payload as AuthenticationResult;
                this._msalService.instance.setActiveAccount(payload.account);
                const state = (payload.state ? decodeURIComponent(payload.state) : '') || '/signed-in-redirect';
                this._router.navigateByUrl(state);
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
