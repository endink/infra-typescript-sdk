export * from "./session"

export class UserPrincipal {
    get isAnonymous(): boolean {
        return this.userId === undefined || this.userId.trim() === ""
    }

    constructor(
        public userId: string = "",
        public userName: string = "",
        public roles: string[] = [],
        public isTwoFactorGranted?: boolean,
    ) {}
}

export interface RefreshTokenParam {
    grant_type: string
    refresh_token: string
    scope: string
}

export interface LoginParam {
    grant_type: string
    username: string
    password: string
    scope?: string
}

export class RegisterInfo {
    public userName: string = ""
    public phoneNumber: string = ""
    public password: string = ""
    public repeatPassword: string = ""
    public captcha: string = ""
    public captchaStamp: string = ""
}

export interface OAuth2AccessToken {
    access_token: string
    expires_in: number
    token_type: string
    scope: string
    two_factor_granted?: boolean
    user_id: string
    user_name: string
    refresh_token?: string
    roles: string[]
}

export interface CheckTokenResult {
    aud: string[]
    scope: string[]
    token_type: string
    two_factor_granted?: boolean
    user_id: string
    user_name: string
    roles: string[]
    exp: number
    client_id: string
    active: boolean
}

const GrantTypes = {
    GRANT_TYPE_PASSWORD: "password",
    GRANT_TYPE_AUTHORIZATION_CODE: "authorization_code",
    GRANT_TYPE_REFRESH_TOKEN: "refresh_token",
    GRANT_TYPE_IMPLICIT: "implicit",
    GRANT_TYPE_CLIENT_CREDENTIALS: "client_credentials",
}

export { GrantTypes }
