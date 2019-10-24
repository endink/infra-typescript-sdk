/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend, RequestOptionsWithResponse, ResponseError, RequestMethod, RequestOptionsInit, RequestResponse } from 'umi-request';
import { RefreshTokenParam, OAuth2AccessToken, GrantTypes, LoginParam, CheckTokenResult } from '../oauht2';
import { RequestOptions } from './types';
import { OAuth2Session, ToastAdapter, ApplicationError } from '../core';
import { clientSession } from '../oauht2/session';

const codeMessage = {
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

function translateError(
    data: ApplicationError,
    response: Response,
    options: RequestOptions): ApplicationError {
    const { errorDescriber, httpCodeDescriber } = options;
    var msg: any;
    if (data !== undefined && data.error !== undefined) {
        const desc = errorDescriber ? errorDescriber[data.error] : data.error_description;
        msg = desc || `未处理错误: ${data.error}`;
    }
    else {
        const codeDescribe = httpCodeDescriber || codeMessage;
        const { status } = response;
        msg = codeDescribe[status] || `HTTP ERROR: ${status}`;
    }
    return { error: data.error || `http_${response.status}`, error_description: msg };
}

/**
 * 异常处理程序
 */
const handleError = (error: ResponseError, options: RequestOptions, skipNotify?: boolean) => {
    const { response, data } = error;
    var skip = skipNotify || false;
    if (response) {
        var e = translateError(data, response, options);
        if (!skip && options.toast) {
            options.toast.error(e.error_description);
        }
        return { ...error, data: e };
    } else {
        const clientError = {
            data: {
                error: "client_error",
                error_description: "无法访问网络，请检查你的网络连接"
            },
            response: { ok: false }
        };
        if (!skip && options.toast) {
            options.toast.error(clientError.data.error_description);
        }
        return clientError;
    }
};

export interface ExtendedRequestMethod<R = true> extends RequestMethod<R> {
    <T = any>(url: string, options?: ExtendedRequestOptionsInit): R extends true ? Promise<RequestResponse<T & ApplicationError>> : Promise<T | ApplicationError>;
    login: (param: LoginParam, options?: OAuth2RequestOptions) => Promise<RequestResponse<OAuth2AccessToken & ApplicationError>>;
    checkToken: (options?: OAuth2RequestOptions & { tokenValue?: string }) => Promise<RequestResponse<CheckTokenResult & ApplicationError>>;
}


export interface ExtendedRequestOptionsInit extends RequestOptionsInit {
    skipAuth?: boolean;
    skipNotifyError?: boolean;
    getResponse?: boolean;
}

export type ResponseLike = Partial<Omit<Response, "ok">> & { ok: boolean };

export type RequestResponseLike<T> = { response: ResponseLike, data: T };

export type OAuth2RequestOptions = Omit<ExtendedRequestOptionsInit, "data" | "method" | "headers" | "requestType" | "skipAuth">;

const requestContext: Pick<RequestOptions, "accessTokenUrl" | "checkTokenUrl"> & { session?: OAuth2Session } = {
    accessTokenUrl: "",
    checkTokenUrl: "",
};


export function initRequest(options: RequestOptions, session?: OAuth2Session) {
    const { clientId, clientSecret } = options;
    requestContext.session = session || clientSession;
    requestContext.session.setClient(clientId, clientSecret);
    requestContext.accessTokenUrl = options.accessTokenUrl;
    requestContext.checkTokenUrl = options.checkTokenUrl;
    /**
 * 配置request请求时的默认参数
 */
    const request = extend({
        credentials: 'omit', // 默认请求是否带上cookie
        getResponse: true
    });

    request.use(async (ctx, next) => {
        if (ctx && ctx.req && ctx.req.options && ((typeof ctx.req.options.errorHandler) === "undefined")) {
            const op = ctx.req.options as ExtendedRequestOptionsInit;
            op.errorHandler = (e) => { return handleError(e, options, op.skipNotifyError) };
        }

        if (ctx.req.options["skipAuth"] !== true && requestContext.session && requestContext.session.isLogged) {
            if (requestContext.session.isTokenExpired) {
                const data: RefreshTokenParam = {
                    grant_type: GrantTypes.GRANT_TYPE_REFRESH_TOKEN,
                    refresh_token: requestContext.session.accessToken!!.refresh_token || "",
                    scope: requestContext.session.accessToken!!.scope
                };
                //自动刷新缓存
                const requestOptions: RequestOptionsWithResponse = {
                    getResponse: true,
                    requestType: "form",
                    method: "post",
                    data: data,
                    headers: { "Authorization": requestContext.session.getClientTokenHeaderValue() }
                };
                (requestOptions as any)["skipAuth"] = true;
                const r = await request<OAuth2AccessToken>(options.accessTokenUrl, requestOptions);
                if (r.response && r.response.ok) {
                    const token = r.data as OAuth2AccessToken;
                    requestContext.session.saveToken(token);
                } else {
                    ctx.res = r;
                    return;
                }
            }
            const headers = ctx.req.options.headers || {};
            if (typeof headers["Authorization"] === "undefined") {
                headers["Authorization"] = requestContext.session.getAuthTokenHeaderValue();
            }
            await next();
        } else {
            await next();
        }
    });

    const r = request as ExtendedRequestMethod;
    r.login = (
        param: LoginParam,
        options?: OAuth2RequestOptions) => {
        const { accessTokenUrl } = requestContext;

        const settings: ExtendedRequestOptionsInit = {
            method: "POST",
            data: param,
            requestType: "form",
            headers: { "Authorization": clientSession.getClientTokenHeaderValue() }
        };
        const s = { ...settings, ...options, skipAuth: true } as ExtendedRequestOptionsInit;

        return request<OAuth2AccessToken & ApplicationError>(accessTokenUrl, s);
    };

    r.checkToken = async (
        options?: OAuth2RequestOptions & { tokenValue?: string }) => {
        const { checkTokenUrl, session: current } = requestContext;

        const settings: ExtendedRequestOptionsInit = {
            method: "GET",
            headers: { "Authorization": clientSession.getClientTokenHeaderValue() }
        };
        const s = { ...settings, ...options, skipAuth: true } as ExtendedRequestOptionsInit;
        const inputToken = (options || {}).tokenValue;
        const token = inputToken || ((current && current.accessToken) ? current.accessToken.access_token : "");
        if (token.length) {
            const r: CheckTokenResult = {
                aud: [],
                scope: [],
                token_type: "",
                user_id: "",
                user_name: "",
                roles: [],
                exp: 0,
                client_id: "",
                active: false
            };
            return { response: { ok: true }, data: r } as RequestResponse<CheckTokenResult>;
        }
        return await request<CheckTokenResult & ApplicationError>(`${checkTokenUrl}?token=${token}`, s);
    };

    return r;
}

