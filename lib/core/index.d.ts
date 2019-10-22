import { OAuth2AccessToken, UserPrincipal } from "../oauht2";
export interface ApplicationError {
    error?: string;
    error_description?: string;
    param?: string;
    param_errors?: Record<string, string>;
}
export interface ToastAdapter {
    error(message?: string): void;
}
export interface OAuth2Session {
    readonly clientId: string;
    readonly secret: string;
    readonly isTokenExpired: boolean;
    readonly isLogged: boolean;
    accessToken?: OAuth2AccessToken;
    acccessTokenCreated?: number;
    user: UserPrincipal;
    getAuthTokenHeaderValue: () => string;
    getRefreshTokenHeaderValue: () => string;
    getClientTokenHeaderValue: () => string;
    clearToken: () => void;
    saveToken: (accessToken: OAuth2AccessToken) => void;
    loadToken: () => void;
    setClient: (clientId: string, secret: string) => void;
}
