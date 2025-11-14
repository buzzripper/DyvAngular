import {
    EnvironmentProviders,
    Provider,
    inject,
    provideAppInitializer,
    provideEnvironmentInitializer,
} from '@angular/core';
import {
    MsalBroadcastService,
    MsalGuard,
    MsalService,
    MSAL_GUARD_CONFIG,
    MSAL_INSTANCE,
    MSAL_INTERCEPTOR_CONFIG,
    type MsalGuardConfiguration,
    type MsalInterceptorConfiguration,
} from '@azure/msal-angular';
import {
    BrowserCacheLocation,
    InteractionType,
    LogLevel,
    PublicClientApplication,
    type IPublicClientApplication,
} from '@azure/msal-browser';

// Azure Entra External ID configuration
const TENANT_ID = '1c3cdcca-ba60-4ad2-9892-626f5d92bc09';
const CLIENT_ID = 'baff14d8-4373-496a-841b-625f5942d89b';
const AUTHORITY = `https://dyvenix.ciamlogin.com/${TENANT_ID}`;
const DEFAULT_SCOPES = [
    'openid',
    'profile',
    'offline_access',
    'api://dc02d6fb-755a-41b3-9bb7-ffa3acb35271/Orders.Modify',
    'api://dc02d6fb-755a-41b3-9bb7-ffa3acb35271/Files.Read',
];

function loggerCallback(level: LogLevel, message: string): void {
    if (level <= LogLevel.Info) {
        // eslint-disable-next-line no-console
        console.log(message);
    }
}

function MSALInstanceFactory(): IPublicClientApplication {
    return new PublicClientApplication({
        auth: {
            clientId: CLIENT_ID,
            authority: AUTHORITY,
            redirectUri: `${window.location.origin}/auth/callback`,
            postLogoutRedirectUri: window.location.origin,
            navigateToLoginRequestUrl: true,
        },
        cache: {
            cacheLocation: BrowserCacheLocation.LocalStorage,
            storeAuthStateInCookie: false,
        },
        system: {
            loggerOptions: {
                loggerCallback,
                piiLoggingEnabled: false,
                logLevel: LogLevel.Warning,
            },
        },
    });
}

function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        authRequest: {
            scopes: DEFAULT_SCOPES,
        },
    };
}

function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map<string, Array<string>>([
            // Fill with your API base URLs to auto-attach access tokens
        ]),
    };
}

export const provideAuth = (): Array<Provider | EnvironmentProviders> => {
    return [
        { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },
        { provide: MSAL_GUARD_CONFIG, useFactory: MSALGuardConfigFactory },
        { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: MSALInterceptorConfigFactory },
        MsalService,
        MsalGuard,
        MsalBroadcastService,
        // Ensure MSAL is initialized before app starts
        provideAppInitializer(() => {
            const msal = inject(MsalService);
            // initialize returns a Promise<void>
            return msal.instance.initialize();
        }),
        provideEnvironmentInitializer(() => inject(MsalService)),
    ];
};
