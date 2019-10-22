/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { RequestMethod, RequestOptionsInit, RequestResponse } from 'umi-request';
import { RequestOptions } from './RequestOptions';
import ClientSession from '../core';
export interface ExtendedRequestMethod<R = true> extends RequestMethod<R> {
    <T = any>(url: string, options?: ExtendedRequestOptionsInit): R extends true ? Promise<RequestResponse<T>> : Promise<T>;
}
export interface ExtendedRequestOptionsInit extends RequestOptionsInit {
    skipAuth?: boolean;
    skipNotifyError?: boolean;
    getResponse?: boolean;
}
export declare function initRequest(options: RequestOptions, clientSession?: ClientSession): ExtendedRequestMethod<true>;
