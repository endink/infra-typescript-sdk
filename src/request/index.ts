/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend, RequestOptionsWithResponse, ResponseError, RequestMethod, RequestOptionsInit, RequestResponse } from 'umi-request';
import { DefaultClientSession } from '../core/DefaultClientSession';
import { RefreshTokenParam, OAuth2AccessToken, GrantTypes } from '../oauht2';
import { RequestOptions } from './RequestOptions';
import ClientSession, { ToastAdapter, ApplicationError } from '../core';

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
    errorDescribe?: Map<string, string>,
    httpCodeDescribe?: Map<string, string>): ApplicationError {
    var msg: any;
    if (data !== undefined && data.error !== undefined) {
        const desc = errorDescribe ? errorDescribe[data.error] : undefined;
        msg = desc || `未处理错误: ${data.error}`;
    }
    else {
        const codeDescribe = httpCodeDescribe || codeMessage;
        const { status } = response;
        msg = codeDescribe[status] || '未知异常';
    }
    return { error: data.error || `http_${response.status}`, error_description: msg };
}

/**
 * 异常处理程序
 */
const handleError = (error: ResponseError, toast?: ToastAdapter, skipNotify?: boolean) => {
    const { response, data } = error;
    var skip = skipNotify || false;
    if (response) {
        var e = translateError(data, response);
        if (!skip && toast) {
            toast.error(e.error_description);
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
        if (!skip && toast) {
            toast.error(clientError.data.error_description);
        }
        return clientError;
    }
};

export interface ExtendedRequestMethod<R = true> extends RequestMethod<R> {
    <T = any>(url: string, options?: ExtendedRequestOptionsInit): R extends true ? Promise<RequestResponse<T>> : Promise<T>;
}

export interface ExtendedRequestOptionsInit extends RequestOptionsInit {
    skipAuth?: boolean,
    skipNotifyError?: boolean,
    getResponse?: boolean,
}



export function initRequest(options: RequestOptions, clientSession?: ClientSession) {
    const { clientId, clientSecret } = options;
    const currentSession = clientSession || DefaultClientSession;
    currentSession.setClient(clientId, clientSecret);
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
            op.errorHandler = (e) => { return handleError(e, options.toast, op.skipNotifyError) };
        }

        if (ctx.req.options["skipAuth"] !== true && currentSession.isLogged) {
            if (currentSession.isTokenExpired) {
                const data: RefreshTokenParam = {
                    grant_type: GrantTypes.GRANT_TYPE_REFRESH_TOKEN,
                    refresh_token: currentSession.accessToken!!.refresh_token || "",
                    scope: currentSession.accessToken!!.scope
                };
                //自动刷新缓存
                const requestOptions: RequestOptionsWithResponse = {
                    getResponse: true,
                    requestType: "form",
                    method: "post",
                    data: data,
                    headers: { "Authorization": currentSession.getClientTokenHeaderValue() }
                };
                (requestOptions as any)["skipAuth"] = true;
                const r = await request<OAuth2AccessToken>(options.accessTokenUrl, requestOptions);
                if (r.response && r.response.ok) {
                    const token = r.data as OAuth2AccessToken;
                    currentSession.saveToken(token);
                } else {
                    ctx.res = r;
                    return;
                }
            }
            const headers = ctx.req.options.headers || {};
            if (typeof headers["Authorization"] === "undefined") {
                headers["Authorization"] = currentSession.getAuthTokenHeaderValue();
            }
            await next();
        } else {
            await next();
        }
    });

    return request as ExtendedRequestMethod;
}
