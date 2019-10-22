"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
var umi_request_1 = require("umi-request");
var oauht2_1 = require("../oauht2");
var session_1 = __importDefault(require("../oauht2/session"));
var codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
};
function translateError(data, response, errorDescribe, httpCodeDescribe) {
    var msg;
    if (data !== undefined && data.error !== undefined) {
        var desc = errorDescribe ? errorDescribe[data.error] : undefined;
        msg = desc || "\u672A\u5904\u7406\u9519\u8BEF: " + data.error;
    }
    else {
        var codeDescribe = httpCodeDescribe || codeMessage;
        var status_1 = response.status;
        msg = codeDescribe[status_1] || '未知异常';
    }
    return { error: data.error || "http_" + response.status, error_description: msg };
}
/**
 * 异常处理程序
 */
var handleError = function (error, toast, skipNotify) {
    var response = error.response, data = error.data;
    var skip = skipNotify || false;
    if (response) {
        var e = translateError(data, response);
        if (!skip && toast) {
            toast.error(e.error_description);
        }
        return __assign(__assign({}, error), { data: e });
    }
    else {
        var clientError = {
            data: {
                error: "client_error",
                error_description: "无法访问网络，请检查你的网络连接"
            },
            response: { ok: false }
        };
        if (!skip && toast) {
            toast.error(clientError.data.error_description);
        }
        return clientError;
    }
};
var ClientSession = {
    current: undefined
};
function initRequest(options, session) {
    var _this = this;
    var clientId = options.clientId, clientSecret = options.clientSecret;
    ClientSession.current = session || session_1.default;
    ClientSession.current.setClient(clientId, clientSecret);
    /**
 * 配置request请求时的默认参数
 */
    var request = umi_request_1.extend({
        credentials: 'omit',
        getResponse: true
    });
    request.use(function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
        var op_1, data, requestOptions, r, token, headers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (ctx && ctx.req && ctx.req.options && ((typeof ctx.req.options.errorHandler) === "undefined")) {
                        op_1 = ctx.req.options;
                        op_1.errorHandler = function (e) { return handleError(e, options.toast, op_1.skipNotifyError); };
                    }
                    if (!(ctx.req.options["skipAuth"] !== true && ClientSession.current.isLogged)) return [3 /*break*/, 4];
                    if (!ClientSession.current.isTokenExpired) return [3 /*break*/, 2];
                    data = {
                        grant_type: oauht2_1.GrantTypes.GRANT_TYPE_REFRESH_TOKEN,
                        refresh_token: ClientSession.current.accessToken.refresh_token || "",
                        scope: ClientSession.current.accessToken.scope
                    };
                    requestOptions = {
                        getResponse: true,
                        requestType: "form",
                        method: "post",
                        data: data,
                        headers: { "Authorization": ClientSession.current.getClientTokenHeaderValue() }
                    };
                    requestOptions["skipAuth"] = true;
                    return [4 /*yield*/, request(options.accessTokenUrl, requestOptions)];
                case 1:
                    r = _a.sent();
                    if (r.response && r.response.ok) {
                        token = r.data;
                        ClientSession.current.saveToken(token);
                    }
                    else {
                        ctx.res = r;
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    headers = ctx.req.options.headers || {};
                    if (typeof headers["Authorization"] === "undefined") {
                        headers["Authorization"] = ClientSession.current.getAuthTokenHeaderValue();
                    }
                    return [4 /*yield*/, next()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, next()];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); });
    return request;
}
exports.initRequest = initRequest;
