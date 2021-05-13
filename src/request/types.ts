import { ResponseError } from "umi-request";
import { ToastAdapter } from "../core";

export interface ErrorContext{
    error: ResponseError;
    options: RequestOptions; 
    skipNotify?: boolean;
}

export interface CustomErrorHandler{
    handle(context: ErrorContext): Boolean;
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
}
