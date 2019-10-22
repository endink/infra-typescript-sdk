import ClientSession, { ToastAdapter } from "../core";

export interface RequestOptions {
    clientId: string;
    clientSecret:string;
    accessTokenUrl:string;
    toast?:ToastAdapter;
    errorDescibe?:Map<string, string>;
    httpCodeDescribe?:Map<string, string>;
}
