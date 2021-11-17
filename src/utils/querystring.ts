import { isNotNullOrBlankString, isNullOrBlankString } from "./core";

export function toQueryString(baseUrl: string, data: Record<string, string | number | undefined>, encode?: boolean){
    let qs:string = "";
    const encodeRequired = encode ?? true;
    for(const key of Object.keys(data)){
        const value = data[key];
        
        if(value !== undefined && ((typeof value) !== "string" || !isNullOrBlankString(value))){
            const v = encodeRequired ? value : encodeURIComponent(`${value}`);
            qs += (qs.length ? `&${key}=${v}` : `${key}=${v}`);
        }
    }
    return `${baseUrl}?${qs}`;
}

export function parseQueryString(url: string): Record<string, string> {
    const index = url.indexOf("?");
    if (index === -1 || index === (url.length - 1)) {
        return {};
    }
    const qs = url.substr(index + 1); // 获取url中"?"符后的字串   
    const args = {}; // 保存参数数据的对象
    const items = qs.length ? qs.split("&") : [];// 取得每一个参数项,

    for (const expression of items) {
        const item = expression.split("=");
        if (item.length === 2) {
            const name = decodeURIComponent(item[0]);
            const value = decodeURIComponent(item[1]);
            if (isNotNullOrBlankString(name)) {
                args[name] = value;
            }
        }
    }
    return args;
}