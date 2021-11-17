import { ResponseError } from "umi-request";
import { OAuth2Session, ToastAdapter } from "../core";

export interface ErrorContext {
    error: ResponseError;
    options: RequestOptions;
    skipNotify?: boolean;
}

export interface CustomErrorHandler {
    handle(context: ErrorContext): boolean;
}

export interface RequestOptions {
    clientId: string;
    clientSecret: string;
    accessTokenUrl: string;
    checkTokenUrl: string;
    toast?: ToastAdapter;
    errorDescriber?: Record<string, string>;
    httpCodeDescriber?: Record<string, string>;
    errorHandlers?: CustomErrorHandler[];
    noneOAuth2?: boolean;
}

export type RequestContext = Pick<RequestOptions, "accessTokenUrl" | "checkTokenUrl"> & { session?: OAuth2Session };