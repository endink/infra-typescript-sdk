export declare class UserPrincipal {
    userId: string;
    userName: string;
    roles: string[];
    isTwoFactorGranted?: boolean | undefined;
    readonly isAnonymous: boolean;
    constructor(userId?: string, userName?: string, roles?: string[], isTwoFactorGranted?: boolean | undefined);
}
export interface RefreshTokenParam {
    grant_type: string;
    refresh_token: string;
    scope: string;
}
export interface LoginParam {
    grant_type: string;
    username: string;
    password: string;
    scope?: string;
}
export declare class RegisterInfo {
    userName: string;
    phoneNumber: string;
    password: string;
    repeatPassword: string;
    captcha: string;
    captchaStamp: string;
}
export interface OAuth2AccessToken {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    two_factor_granted?: boolean;
    user_id: string;
    user_name: string;
    refresh_token?: string;
    roles: string[];
}
export interface CheckTokenResult {
    aud: string[];
    scope: string[];
    token_type: string;
    two_factor_granted?: boolean;
    user_id: string;
    user_name: string;
    roles: string[];
    exp: number;
    client_id: string;
    active: boolean;
}
declare const GrantTypes: {
    GRANT_TYPE_PASSWORD: string;
    GRANT_TYPE_AUTHORIZATION_CODE: string;
    GRANT_TYPE_REFRESH_TOKEN: string;
    GRANT_TYPE_IMPLICIT: string;
    GRANT_TYPE_CLIENT_CREDENTIALS: string;
};
export { GrantTypes };
