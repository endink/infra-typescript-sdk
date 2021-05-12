import { UserPrincipal, OAuth2AccessToken } from "./types";
import { OAuth2Session } from "../core";
import { isNullOrEmptyString } from "../utils";

interface SaveObject {
    token: OAuth2AccessToken;
    version: string;
    created: number;
}

const version = "1.0.1";

const client = {
    clientId: "",
    secret: ""
};

const anonymousPrincipal: UserPrincipal = {
    isAnonymous: true,
    attachedAttributes: {},
    getRoles: () => [],
    hasRole: () => false,
    hasAnyOfRoles: () => false
};

function tokenToPrincipal(token: OAuth2AccessToken): UserPrincipal {
    const roles:string[] = [];
    const attributes:{ [name:string]:string } = {};

    for(const r in token.authorities){
        if(r.indexOf("ROLE_") === 0){
            roles.push(r);
        }
    }

    const wellknownProperties = [
        "user_id",
        "access_token",
        "token_type",
        "refresh_token",
        "expires_in",
        "scope",
        "two_factor_granted",
        "user_id",
        "authorities",
        "username"
    ];

    for(const att in token){
        if(wellknownProperties.indexOf(att) < 0){
            attributes[att] = token[att]
        }
    }

    const p = {
        token: token,
        roles: roles,
        attributes: attributes,

        get userId(): string | undefined {
            return this.token.user_id;
        },

        get userName(): string | undefined {
            return this.token.username;
        },

        get authorities(): string[] | undefined {
            return this.token?.authorities || [];
        },

        get isTwoFactorGranted(): boolean | undefined {
            return this.token?.two_factor_granted;
        },

        get attachedAttributes():{ [name:string]:string } {
            return this.attributes;
        },

        getRoles(): string[] {
            return this.roles;
        },

        get isAnonymous(): boolean {
            return isNullOrEmptyString(this.token?.user_id)
        },

        hasRole(role: String): boolean {
            return isNullOrEmptyString(this.roles?.find(item => item === role));
        },

        hasAnyOfRoles(...roles: String[]): boolean {
            const rs = roles || [];
            if (rs.length) {
                for (const r in roles) {
                    if (this.hasRole(r)) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    return p;

}


function createPrincipal(accessToken?: OAuth2AccessToken): UserPrincipal {
    return accessToken ? tokenToPrincipal(accessToken) : anonymousPrincipal;
}

const clientSession: OAuth2Session = {
    user: anonymousPrincipal,
    get isLogged(): boolean {
        return this.accessToken !== undefined && this.acccessTokenCreated !== undefined;
    },

    setClient(clientId: string, secret: string) {
        client.clientId = clientId;
        client.secret = secret;
    },

    get clientId() {
        return client.clientId;
    },

    get secret() {
        return client.secret;
    },

    get isTokenExpired(): boolean {
        if (this.accessToken && typeof this.acccessTokenCreated === "number") {
            return Date.now().valueOf() - this.acccessTokenCreated!! > this.accessToken.expires_in * 1000;
        }
        return true;
    },

    clearToken() {
        this.accessToken = undefined;
        this.acccessTokenCreated = undefined;
        this.user = anonymousPrincipal;
        sessionStorage.removeItem("clientInfo");
    },

    getClientTokenHeaderValue() {
        const key = `${this.clientId}:${this.secret}`;
        return `basic ${btoa(key)}`;
    },

    getRefreshTokenHeaderValue() {
        return `bearer ${this.accessToken ? this.accessToken.refresh_token : ""}`;
    },

    getAuthTokenHeaderValue() {
        if (!this.isLogged) {
            const key = `${this.clientId}:${this.secret}`;
            return `basic ${btoa(key)}`;
        } else {
            return `bearer ${this.accessToken!!.access_token}`;
        }
    },

    loadToken() {
        const json = sessionStorage.getItem("clientInfo");
        if (typeof json === "string" && json != null) {
            const saved: SaveObject = JSON.parse(json);
            if (saved.version !== version) {
                sessionStorage.removeItem("clientInfo");
            } else {
                this.accessToken = saved.token;
                this.acccessTokenCreated = saved.created;
                this.user = createPrincipal(this.accessToken);
            }
        }
    },

    saveToken(token: OAuth2AccessToken) {
        this.user = createPrincipal(token);
        this.acccessTokenCreated = Date.now().valueOf();
        this.accessToken = token;

        const save = { token, version, created: this.acccessTokenCreated } as SaveObject;
        sessionStorage.setItem("clientInfo", JSON.stringify(save));
    }
};

export { clientSession };
