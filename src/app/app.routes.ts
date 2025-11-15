import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { MsalGuard, MsalRedirectComponent } from '@azure/msal-angular';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'example'},

    // MSAL redirect URI handler
    { path: 'auth/callback', component: MsalRedirectComponent },

    // Redirect signed-in user to the '/example'
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'example'},

    // Public auth routes (sign-in & sign-out should not force login)
    {
        path: '',
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
        ]
    },

    // Admin routes (protected)
    {
        path: '',
        canActivate: [MsalGuard],
        canActivateChild: [MsalGuard],
        component: LayoutComponent,
        resolve: { initialData: initialDataResolver },
        children: [
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes')},
        ]
    }
];
