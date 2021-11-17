export function delay(ms: number): Promise<void> {
    return new Promise(resolve => {
        const timeout = setTimeout(() => {
            clearTimeout(timeout);
            resolve();
        }, ms)
    });
}

async function retryCore<T=any>(
    action: ()=>T | Promise<T>, 
    resolve: (value: T | PromiseLike<T>) => void, 
    reject: (reason?: any) => void, 
    retryIndex: number, 
    retryCount: number, 
    intervalMilss: number) {
    try{
        const v = await wrapPromise(()=>action());
        resolve(v);
    }catch(e){
        if((retryIndex + 1) < retryCount){
            await delay(intervalMilss);
            retryCore(action, resolve, reject, retryIndex + 1, retryCount, intervalMilss);
        }else{
            reject(e);
        }
    }
}

export function retry<T=any>(action: ()=>T | Promise<T>, maxRetryCount: number, intervalMilss: number) : Promise<T> {
    return new Promise<T>((resolve, reject)=>{
        retryCore(action, resolve, reject, 0, maxRetryCount, intervalMilss);
    });
}

export function isPromise(r: any) {
    return r && (r as Promise<any>).then !== undefined;
}

export function wrapPromise<T = any>(action: () => T | Promise<T>): Promise<T> {
    let r: any;
    try {
        r = action();
    } catch (error) {
        return Promise.reject<T>(error);
    }
    if (isPromise(r)) {
        return r as Promise<T>;
    }
    return Promise.resolve<T>(r);
}