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

function createPrincipal(accessToken?: OAuth2AccessToken): UserPrincipal {
    return accessToken
        ? {
              userId: accessToken.user_id,
              userName: accessToken.user_name,
              roles: accessToken.roles,
              isTwoFactorGranted: accessToken.two_factor_granted,
              isAnonymous: isNullOrEmptyString(accessToken.user_id)
          }
        : { isAnonymous: true };
}

const clientSession: OAuth2Session = {
    user: { isAnonymous: true },
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
        this.user = { isAnonymous: true };
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
