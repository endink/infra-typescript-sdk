import moment, { Moment } from "moment";
declare const regexUrl: RegExp;
declare const regexEmail: RegExp;
declare const regexPositiveNumber: RegExp;
declare const regexChineseMobileNumber: RegExp;
export declare const isUrl: (path: string) => boolean;
export declare const isEmail: (path: string) => boolean;
export declare const isPositiveNumber: (path: string) => boolean;
export declare const isChineseMobileNumber: (path: string) => boolean;
export declare function isPositiveInt(value?: string): boolean;
export declare const isNullOrEmptyString: (value?: any) => boolean;
export declare const notNullOrEmptyString: (value?: any) => boolean;
export declare function generateUUID(): string;
export declare function parseTimeStamp(ticks: string | number | undefined): moment.Moment | undefined;
export declare function displayTimeStamp(ticks: string | undefined, showTime?: boolean): string;
export declare type SessionCachedType<T> = {
    [P in keyof T]?: T[P];
};
export declare class SessionCached<T> implements SessionCachedType<{
    data: T;
    expired: number;
}> {
    data: T;
    expired: number;
    constructor(data: T, expired: number);
}
export declare function getOrSetCached<T>(key: string, timeout: Moment, setter: () => Promise<T | undefined | null>): Promise<any>;
export { regexUrl, regexEmail, regexPositiveNumber, regexChineseMobileNumber };
