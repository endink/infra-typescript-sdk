import dayjs, { Dayjs } from "dayjs";

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const regexUrl =
    /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
const regexEmail =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const regexPositiveNumber = /^([0]*[1-9][0-9]*)(\.[0-9]*)?$/;
const regexChineseMobileNumber =
    /^((13[0-9])|(14[5,7,9])|(15([0-3]|[5-9]))|(166)|(17[0,1,3,5,6,7,8])|(18[0-9])|(19[8|9]))\d{8}$/;

export const isUrl = (path: string): boolean => regexUrl.test(path);
export const isEmail = (path: string): boolean => regexEmail.test(path);
export const isPositiveNumber = (path: string): boolean => regexPositiveNumber.test(path);
export const isChineseMobileNumber = (path: string): boolean => regexChineseMobileNumber.test(path);
export function isPositiveInt(value?: string): boolean {
    return value !== undefined && /^\d+$/.test(value) && Number(value) > 0;
}

export const rangeNumber = (from: number, to: number, step: number = 1) => [...Array(Math.floor((to - from) / step) + 1)].map((_, i) => from + i * step);

export const isNullOrBlankString = (value?: any) =>
    typeof value !== "string" || value == null || value!!.trim().length === 0;

export const isNotNullOrBlankString = (value?: any) => !isNullOrBlankString(value);

export function generateUUID() {
    let d = new Date().getTime();
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
}

export function randomStr(len: number = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    const maxPos = chars.length
    let s = ""
    for (let i = 0; i < len; i++) {
        s += chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return s
}


export type SessionCachedType<T> = {
    [P in keyof T]?: T[P];
};

export class SessionCached<T> implements SessionCachedType<{ data: T; expired: number }> {
    constructor(public data: T, public expired: number) {}
}

export async function getOrSetCached<T>(key: string, timeout: Dayjs, setter: () => Promise<T | undefined | null>) {
    const cached = sessionStorage.getItem(key);
    if (isNotNullOrBlankString(cached)) {
        let item: any;
        try {
            item = JSON.parse(cached as string) as SessionCached<T>;
        } catch (e) {
            console.warn(e);
        }
        if (item !== undefined && item.expired > dayjs()) {
            return item.data;
        } else {
            sessionStorage.removeItem(key);
        }
    }
    const data = await setter();
    if (data !== undefined && data !== null) {
        const cache = new SessionCached<T>(data, timeout.valueOf());
        sessionStorage.setItem(key, JSON.stringify(cache));
    }
    return data;
}

export { regexUrl, regexEmail, regexPositiveNumber, regexChineseMobileNumber };


