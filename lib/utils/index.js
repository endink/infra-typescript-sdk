"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = __importDefault(require("moment"));
/* eslint no-useless-escape:0 import/prefer-default-export:0 */
var regexUrl = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
exports.regexUrl = regexUrl;
var regexEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
exports.regexEmail = regexEmail;
var regexPositiveNumber = /^([0]*[1-9][0-9]*)(\.[0-9]*)?$/;
exports.regexPositiveNumber = regexPositiveNumber;
var regexChineseMobileNumber = /^((13[0-9])|(14[5,7,9])|(15([0-3]|[5-9]))|(166)|(17[0,1,3,5,6,7,8])|(18[0-9])|(19[8|9]))\d{8}$/;
exports.regexChineseMobileNumber = regexChineseMobileNumber;
exports.isUrl = function (path) { return regexUrl.test(path); };
exports.isEmail = function (path) { return regexEmail.test(path); };
exports.isPositiveNumber = function (path) { return regexPositiveNumber.test(path); };
exports.isChineseMobileNumber = function (path) { return regexChineseMobileNumber.test(path); };
function isPositiveInt(value) {
    return value !== undefined && /^\d+$/.test(value) && Number(value) > 0;
}
exports.isPositiveInt = isPositiveInt;
exports.isNullOrEmptyString = function (value) { return ((typeof value) !== "string") || value == null || value.trim().length === 0; };
exports.notNullOrEmptyString = function (value) { return !exports.isNullOrEmptyString(value); };
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
exports.generateUUID = generateUUID;
;
function parseTimeStamp(ticks) {
    var tikcsStr = (ticks ? ((typeof ticks) === "string" ? ticks : ticks.toString()) : ticks);
    if ((exports.isNullOrEmptyString(tikcsStr)) && isPositiveInt(tikcsStr)) {
        return undefined;
    }
    var ticksNum = Number(tikcsStr);
    var time = moment_1.default(ticksNum);
    return time;
}
exports.parseTimeStamp = parseTimeStamp;
function displayTimeStamp(ticks, showTime) {
    if (showTime === void 0) { showTime = false; }
    var m = parseTimeStamp(ticks);
    if (m) {
        var format = showTime ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD";
        return m.format(format);
    }
    return "";
}
exports.displayTimeStamp = displayTimeStamp;
var SessionCached = /** @class */ (function () {
    function SessionCached(data, expired) {
        this.data = data;
        this.expired = expired;
    }
    return SessionCached;
}());
exports.SessionCached = SessionCached;
function getOrSetCached(key, timeout, setter) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, item, data, item_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cached = sessionStorage.getItem(key);
                    if (exports.notNullOrEmptyString(cached)) {
                        try {
                            item = JSON.parse(cached);
                        }
                        catch (e) {
                        }
                        if (item !== undefined && item.expired > moment_1.default.now()) {
                            return [2 /*return*/, item.data];
                        }
                        else {
                            sessionStorage.removeItem(key);
                        }
                    }
                    return [4 /*yield*/, setter()];
                case 1:
                    data = _a.sent();
                    if (data !== undefined && data !== null) {
                        item_1 = new SessionCached(data, timeout.valueOf());
                        sessionStorage.setItem(key, JSON.stringify(item_1));
                    }
                    return [2 /*return*/, data];
            }
        });
    });
}
exports.getOrSetCached = getOrSetCached;
