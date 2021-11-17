

export function maxValue<T>(data: T[], field: (item:T)=>number): number | undefined {
    if(data.length){
        let current = Number.MIN_VALUE;
        data.forEach(i=>{
            const filedValue = field(i);
            current = Math.max(filedValue, current);
        });
        return current;
    }
    return undefined;
}



export function sum<T>(array: T[], getter: (item:T)=>number){
    let c = 0;
    for(const item of array){
        const v = getter(item);
        c += v;
    }
    return c;
}

export function max<T>(array: T[], getter: (item:T)=>number): T | undefined{
    let item: T | undefined;
    if(array.length){
        let current = Number.MIN_VALUE;
        array.forEach(i=>{
            const filedValue = getter(i);
            if(filedValue > current){
                current = filedValue;
                item = i;
            }
        });
        return item;
    }
    return undefined;
}

export function min<T>(array: T[], getter: (item:T)=>number): T | undefined{
    let item: T | undefined;
    if(array.length){
        let current = Number.MAX_VALUE;
        array.forEach(i=>{
            const filedValue = getter(i);
            if(filedValue < current){
                current = filedValue;
                item = i;
            }
        });
        return item;
    }
    return undefined;
}

export interface GroupItem<T, TKey> {
    key: TKey,
    list: T[]
}

export function groupBy<T, TKey extends string | number>(array: T[], getter:(item:T)=>TKey): GroupItem<T, TKey>[]{
    const group: GroupItem<T, TKey>[] = [];
    for(const item of array){
        const key = getter(item);
        if(key === undefined || key === null){
            throw new Error("group key can not be undefined or null");
        }
        const values = group.find(g=>g.key === key);
        if(values){
            values.list.push(item);
        }else{
            const newGroup: GroupItem<T, TKey> = { key, list:[] };
            newGroup.list.push(item);
            group.push(newGroup);
        }
    }
    return group;
}

export function orderBy<T, TKey extends string | number>(array: T[], getter: (item:T)=>TKey): T[] {
    const rec = (arr: T[]) => {
        if(arr.length <= 1) {
            return arr;
        }
        const left: T[] = [];
        const right: T[] = [];
        const base = arr[0];
        // 因为基准线是arr[0]，所以从下标是1也就是第二个开始
        for(let i = 1; i < arr.length; i += 1) {
            const ikey = getter(arr[i]);
            const baseKey = getter(base);

            let r = 0;
            if(typeof ikey === "string"){
                r = ikey < (baseKey as string) ? -1 : 1
            }
            if(typeof ikey === "number"){
                r = ikey < (baseKey as number) ? -1 : 1
            }

            if(r < 0) {
                left.push(arr[i])
            } else {
                right.push(arr[i])
            }
        }
        // 解构一下
        // 递归左边数组和右边数组
        // 左边加上右边加上基准才是完整数组哈
        return [...rec(left), base, ...rec(right)];
    }
    const res = rec(array);
    // 遍历res，赋值到this也就是当前数组本身
    res.forEach((item, key) => {
        array[key] = item;
    });

    return array;
}