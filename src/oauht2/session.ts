import { UserPrincipal, OAuth2AccessToken } from "."
import { OAuth2Session } from "../core"
import { string } from "prop-types"

interface SaveObject {
    token: OAuth2AccessToken
    version: string
    created: number
}

const version = "1.0.1"

const client = {
    clientId: "",
    secret: "",
}

const clientSession: OAuth2Session = {
    user: new UserPrincipal(),
    get isLogged(): boolean {
        return this.accessToken !== undefined && this.acccessTokenCreated !== undefined
    },

    setClient(clientId: string, secret: string) {
        client.clientId = clientId
        client.secret = secret
    },

    get clientId() {
        return client.clientId
    },

    get secret() {
        return client.secret
    },

    get isTokenExpired(): boolean {
        if (this.accessToken && typeof this.acccessTokenCreated === "number") {
            return Date.now().valueOf() - this.acccessTokenCreated!! > this.accessToken.expires_in * 1000
        }
        return true
    },

    clearToken: function() {
        this.accessToken = undefined
        this.acccessTokenCreated = undefined
        this.user = new UserPrincipal()
        sessionStorage.removeItem("clientInfo")
    },

    getClientTokenHeaderValue: function() {
        const key = `${this.clientId}:${this.secret}`
        return `basic ${btoa(key)}`
    },

    getRefreshTokenHeaderValue: function() {
        return `bearer ${this.accessToken ? this.accessToken.refresh_token : ""}`
    },

    getAuthTokenHeaderValue: function() {
        if (!this.isLogged) {
            const key = `${this.clientId}:${this.secret}`
            return `basic ${btoa(key)}`
        } else {
            return `bearer ${this.accessToken!!.access_token}`
        }
    },

    loadToken: function() {
        const json = sessionStorage.getItem("clientInfo")
        if (typeof json === "string" && json != null) {
            const saved: SaveObject = JSON.parse(json)
            if (saved.version !== version) {
                sessionStorage.removeItem("clientInfo")
            } else {
                this.accessToken = saved.token
                //这里必须 new 一下，否则只读属性是 undefine
                this.user = new UserPrincipal(
                    this.accessToken.user_id,
                    this.accessToken.user_name,
                    this.accessToken.roles,
                    this.accessToken.two_factor_granted,
                )
                this.acccessTokenCreated = saved.created
            }
        }
    },

    saveToken: function(token: OAuth2AccessToken) {
        this.user = new UserPrincipal(token.user_id, token.user_name, token.roles, token.two_factor_granted)
        this.acccessTokenCreated = Date.now().valueOf()
        this.accessToken = token

        const save = { token, version, created: this.acccessTokenCreated } as SaveObject
        sessionStorage.setItem("clientInfo", JSON.stringify(save))
    },
}

export { clientSession }
