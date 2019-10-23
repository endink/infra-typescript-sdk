/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { RequestMethod, RequestOptionsInit, RequestResponse } from 'umi-request';
import { OAuth2AccessToken, LoginParam, CheckTokenResult } from '../oauht2';
import { RequestOptions } from './types';
import { OAuth2Session, ApplicationError } from '../core';
export interface ExtendedRequestMethod<R = true> extends RequestMethod<R> {
    <T = any>(url: string, options?: ExtendedRequestOptionsInit): R extends true ? Promise<RequestResponse<T & ApplicationError>> : Promise<T | ApplicationError>;
    login: (param: LoginParam, options?: OAuth2RequestOptions) => Promise<RequestResponse<OAuth2AccessToken & ApplicationError>>;
    checkToken: (options?: OAuth2RequestOptions & {
        tokenValue?: string;
    }) => Promise<RequestResponse<CheckTokenResult & ApplicationError>>;
}
export interface ExtendedRequestOptionsInit extends RequestOptionsInit {
    skipAuth?: boolean;
    skipNotifyError?: boolean;
    getResponse?: boolean;
}
export declare type ResponseLike = Partial<Omit<Response, "ok">> & {
    ok: boolean;
};
export declare type RequestResponseLike<T> = {
    response: ResponseLike;
    data: T;
};
export declare type OAuth2RequestOptions = Omit<ExtendedRequestOptionsInit, "data" | "method" | "headers" | "requestType" | "skipAuth">;
export declare function initRequest(options: RequestOptions, session?: OAuth2Session): ExtendedRequestMethod<true>;
