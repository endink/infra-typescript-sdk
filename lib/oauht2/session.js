"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
var version = "1.0.1";
var client = {
    clientId: "",
    secret: ""
};
var clientSession = {
    user: new _1.UserPrincipal(),
    get isLogged() {
        return (this.accessToken !== undefined && this.acccessTokenCreated !== undefined);
    },
    setClient: function (clientId, secret) {
        client.clientId = clientId;
        client.secret = secret;
    },
    get clientId() {
        return client.clientId;
    },
    get secret() {
        return client.secret;
    },
    get isTokenExpired() {
        if (this.accessToken && (typeof this.acccessTokenCreated) === 'number') {
            return (Date.now().valueOf() - this.acccessTokenCreated) > (this.accessToken.expires_in * 1000);
        }
        return true;
    },
    clearToken: function () {
        this.accessToken = undefined;
        this.acccessTokenCreated = undefined;
        this.user = new _1.UserPrincipal();
        sessionStorage.removeItem("clientInfo");
    },
    getClientTokenHeaderValue: function () {
        var key = this.clientId + ":" + this.secret;
        return "basic " + btoa(key);
    },
    getRefreshTokenHeaderValue: function () {
        return "bearer " + (this.accessToken ? this.accessToken.refresh_token : "");
    },
    getAuthTokenHeaderValue: function () {
        if (!this.isLogged) {
            var key = this.clientId + ":" + this.secret;
            return "basic " + btoa(key);
        }
        else {
            return "bearer " + this.accessToken.access_token;
        }
    },
    loadToken: function () {
        var json = sessionStorage.getItem("clientInfo");
        if ((typeof json) === "string" && json != null) {
            var saved = JSON.parse(json);
            if (saved.version !== version) {
                sessionStorage.removeItem("clientInfo");
            }
            else {
                this.accessToken = saved.token;
                //这里必须 new 一下，否则只读属性是 undefine
                this.user = new _1.UserPrincipal(this.accessToken.user_id, this.accessToken.user_name, this.accessToken.roles, this.accessToken.two_factor_granted);
                this.acccessTokenCreated = saved.created;
            }
        }
    },
    saveToken: function (token) {
        this.user = new _1.UserPrincipal(token.user_id, token.user_name, token.roles, token.two_factor_granted);
        this.acccessTokenCreated = Date.now().valueOf();
        this.accessToken = token;
        var save = { token: token, version: version, created: this.acccessTokenCreated };
        sessionStorage.setItem("clientInfo", JSON.stringify(save));
    }
};
exports.default = clientSession;
