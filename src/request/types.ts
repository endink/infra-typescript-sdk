import {OAuth2Session, ToastAdapter } from "../core";

export interface RequestOptions {
    clientId: string;
    clientSecret:string;
    accessTokenUrl:string;
    toast?:ToastAdapter;
    errorDescibe?:{ [key:string] : string };
    httpCodeDescribe?:{ [key:string] : string };
}
