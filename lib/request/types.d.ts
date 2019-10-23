import { ToastAdapter } from "../core";
export interface RequestOptions {
    clientId: string;
    clientSecret: string;
    accessTokenUrl: string;
    checkTokenUrl: string;
    toast?: ToastAdapter;
    errorDescriber?: Record<string, string>;
    httpCodeDescriber?: Record<string, string>;
}
