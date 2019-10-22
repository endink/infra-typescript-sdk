"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserPrincipal = /** @class */ (function () {
    function UserPrincipal(userId, userName, roles, isTwoFactorGranted) {
        if (userId === void 0) { userId = ""; }
        if (userName === void 0) { userName = ""; }
        if (roles === void 0) { roles = []; }
        this.userId = userId;
        this.userName = userName;
        this.roles = roles;
        this.isTwoFactorGranted = isTwoFactorGranted;
    }
    Object.defineProperty(UserPrincipal.prototype, "isAnonymous", {
        get: function () {
            return this.userId === undefined || this.userId.trim() === "";
        },
        enumerable: true,
        configurable: true
    });
    return UserPrincipal;
}());
exports.UserPrincipal = UserPrincipal;
;
;
var RegisterInfo = /** @class */ (function () {
    function RegisterInfo() {
        this.userName = "";
        this.phoneNumber = "";
        this.password = "";
        this.repeatPassword = "";
        this.captcha = "";
        this.captchaStamp = "";
    }
    return RegisterInfo;
}());
exports.RegisterInfo = RegisterInfo;
var GrantTypes = {
    GRANT_TYPE_PASSWORD: "password",
    GRANT_TYPE_AUTHORIZATION_CODE: "authorization_code",
    GRANT_TYPE_REFRESH_TOKEN: "refresh_token",
    GRANT_TYPE_IMPLICIT: "implicit",
    GRANT_TYPE_CLIENT_CREDENTIALS: "client_credentials",
};
exports.GrantTypes = GrantTypes;
