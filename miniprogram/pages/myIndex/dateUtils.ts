// 日期处理工具模块
import { DateInfo } from './types';
const lunarCalendar = require('../../libs/lunar.js');

export function getLunarDayName(day: number): string {
  const units = ['','一','二','三','四','五','六','七','八','九','十'];
  const tens = ['初','十','廿','卅'];
  
  if(day > 30) return '未知';
  if(day === 10) return '初十';
  
  let res = tens[Math.floor(day/10)];
  res += units[day%10] || '';
  
  if(day === 20) res = '二十';
  if(day === 30) res = '三十';
  
  return res + (res ? '日' : '');
}

export function getLunarMonthName(month: number): string {
  const names = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
  return names[month - 1] || '';
}

export function getDateInfo(date: Date): DateInfo {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekDay = weekDays[date.getDay()];
  
  const lunar = lunarCalendar.solarToLunar(year, month, day);
  
  if (!lunar || typeof lunar.lunarMonth !== 'number') {
    return {
      solarDate: `${year}年${month}月${day}日`,
      weekDay: `星期${weekDay}`,
      lunarDate: '农历数据异常'
    };
  }

  const adjustedMonth = lunar.lunarMonth;
  const isLeap = lunar.lunarLeapMonth === adjustedMonth;
  const monthStr = isLeap ? `闰${getLunarMonthName(adjustedMonth)}` : getLunarMonthName(adjustedMonth);
  
  return {
    solarDate: `${year}年${month}月${day}日`,
    weekDay: `星期${weekDay}`,
    lunarDate: `农历${monthStr}${getLunarDayName(lunar.lunarDay)}`
  };
}