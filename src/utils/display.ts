import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { isPositiveInt, isNullOrBlankString , rangeNumber} from "./core";
dayjs.extend(utc);

export function parseTimeStamp(ticks: string | number | undefined): dayjs.Dayjs | undefined {
    const tikcsStr = (ticks ? (typeof ticks === "string" ? ticks : ticks.toString()) : ticks) as string | undefined;
    if (isNullOrBlankString(tikcsStr) || !isPositiveInt(tikcsStr)) {
        return undefined;
    }
    const ticksNum = Number(tikcsStr);
    const time = dayjs.utc(ticksNum);
    return time;
}

export function isZeroTimeStamp(ticks: string | number | undefined){
    const m = parseTimeStamp(ticks);
    if(!m){
        return true;
    }
    return isZeroTimeValue(m);
}

function isZeroTimeValue(m: dayjs.Dayjs) {
    return (m.year() === 1970 && m.month() === 0 && m.date() === 1 && m.hour() === 0 && m.minute() === 0 && m.second() === 0);
}

type DateObject = { year: number, month: number, day: number };

export function displayFrendlyMonth(time?: Omit<DateObject, "day"> | string | number) {
    const today = dayjs();
    let t = time ?? dayjs().valueOf();

    if((typeof t) === "string"){
        const timestamp = parseInt(t as string, 0);
        const dt = dayjs(timestamp);
        t = { year: dt.year(), month: dt.month() + 1 }
    }

    if((typeof t) === "number"){
        const dt = dayjs(t as number);
        t = { year: dt.year(), month: dt.month() + 1 }
    }


    const { year, month } = t as Omit<DateObject, "day">;

    const isCurrentMonth = today.year() === year && today.month() + 1 === month;
    if(isCurrentMonth){
      return "本月";
    }

    const isCurrentYear = today.year() === year;
    if(isCurrentYear){
        return `${month}月`;
    }

    return `${year}年${month}月`;
}

export function displayFrendlyDate(time?: DateObject | string | number) {
    const today = dayjs();
    let t = time ?? dayjs().valueOf();

    if((typeof time) === "string"){
        const timestamp = parseInt(time as string, 0);
        const dt = dayjs(timestamp);
        t = { year: dt.year(), month: dt.month() + 1, day: dt.date() }
    }

    if((typeof time) === "number"){
        const dt = dayjs(time as number);
        t = { year: dt.year(), month: dt.month() + 1, day: dt.date() }
    }

    const { year, month, day } = t as DateObject;

    const isToday = today.year() === year && today.month() + 1 === month && today.date() === day;
    if(isToday){
      return "今天";
    }
    const yestoday = today.add(-1, "day");
    const isYestoday = yestoday.year() === year && yestoday.month() + 1 === month && yestoday.date() === day;

    if(isYestoday){
      return "昨天";
    }

    const isCurrentYear = today.year() === year;
    if(isCurrentYear){
        return `${month}月${day}日`;
    }

    return `${year}年${month}月${day}日`;
}

export function displayTimeStamp(ticks: string | undefined, showTime = false): string {
    const m = parseTimeStamp(ticks);
    if (m) {
        if(isZeroTimeValue(m)){
            return "";
        }

        const format = showTime ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD";
        return m.utcOffset(8).format(format);
    }
    return "";
}

export function displayTimeStampFormat(ticks: string | undefined, format: string = "YYYY-MM-DD HH:mm"): string {
    const m = parseTimeStamp(ticks);
    if (m) {
        if(isZeroTimeValue(m)){
            return "";
        }
        return m.utcOffset(8).format(format);
    }
    return "";
}

export function displayCurrency(amount: number | string | undefined, precision: number = 2): string {
    if(amount === undefined){
        return "0.00";
    }
    let i = parseFloat((amount ?? "0").toString());
    if (Number.isNaN(i)) {
        i = 0;
    }
    let minus = "";
    if (i < 0) { minus = "-"; }
    i = Math.abs(i);
    // i = parseInt(((i + .005) * 100).toString());
    // i = i / 100;
    let s = i.toFixed(Math.max(0, precision))
    if (s.indexOf(".") < 0 && precision >= 1) { 
        s += ".";
        rangeNumber(1, precision).forEach(()=>{
            s += "0";
        });
    }
    const dotIndex = s.indexOf(".");
    if (precision >= 1 && dotIndex > (s.length - precision - 1)) { 
        const padding = dotIndex - (s.length - precision - 1);
        rangeNumber(1, padding).forEach(()=>{
            s+= "0";
        });
    }
    s = minus + s;
    return s.toString();
}

