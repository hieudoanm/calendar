type CurrentMonth = 'previous' | 'current' | 'next';

export const generateFullCalendar = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay(); // day of week (0-6)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const weeks: { date: number; currentMonth: CurrentMonth }[][] = [];
  let week: { date: number; currentMonth: CurrentMonth }[] = [];

  let dateCounter = 1;

  for (let i = 0; i < 6; i++) {
    // max 6 weeks
    week = [];
    for (let j = 0; j < 7; j++) {
      let dateObject: { date: number; currentMonth: CurrentMonth };

      // First week
      if (i === 0 && j < firstDay) {
        dateObject = {
          date: prevMonthDays - firstDay + j + 1,
          currentMonth: 'previous',
        };
      }
      // Days of current month
      else if (dateCounter <= daysInMonth) {
        dateObject = { date: dateCounter, currentMonth: 'current' };
        dateCounter++;
      }
      // Days after current month
      else {
        dateObject = {
          date: dateCounter - 1 - daysInMonth + 1,
          currentMonth: 'next',
        };
        dateCounter++;
      }

      week.push(dateObject);
    }
    weeks.push(week);
    if (dateCounter > daysInMonth && i > 3) break; // stop if month finished and enough weeks
  }

  return weeks;
};

export const getWeekOfYear = (date: Date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export class LunarCalendar {
  // Lunar calendar lookup table
  public lunarInfo = [
    0x04bd8,
    0x04ae0,
    0x0a570,
    0x054d5,
    0x0d260,
    0x0d950,
    0x16554,
    0x056a0,
    0x09ad0,
    0x055d2, // 1900-1909

    0x04ae0,
    0x0a5b6,
    0x0a4d0,
    0x0d250,
    0x1d255,
    0x0b540,
    0x0d6a0,
    0x0ada2,
    0x095b0,
    0x14977, // 1910-1919

    0x04970,
    0x0a4b0,
    0x0b4b5,
    0x06a50,
    0x06d40,
    0x1ab54,
    0x02b60,
    0x09570,
    0x052f2,
    0x04970, // 1920-1929

    0x06566,
    0x0d4a0,
    0x0ea50,
    0x06e95,
    0x05ad0,
    0x02b60,
    0x186e3,
    0x092e0,
    0x1c8d7,
    0x0c950, // 1930-1939

    0x0d4a0,
    0x1d8a6,
    0x0b550,
    0x056a0,
    0x1a5b4,
    0x025d0,
    0x092d0,
    0x0d2b2,
    0x0a950,
    0x0b557, // 1940-1949

    0x06ca0,
    0x0b550,
    0x15355,
    0x04da0,
    0x0a5b0,
    0x14573,
    0x052b0,
    0x0a9a8,
    0x0e950,
    0x06aa0, // 1950-1959

    0x0aea6,
    0x0ab50,
    0x04b60,
    0x0aae4,
    0x0a570,
    0x05260,
    0x0f263,
    0x0d950,
    0x05b57,
    0x056a0, // 1960-1969

    0x096d0,
    0x04dd5,
    0x04ad0,
    0x0a4d0,
    0x0d4d4,
    0x0d250,
    0x0d558,
    0x0b540,
    0x0b6a0,
    0x195a6, // 1970-1979

    0x095b0,
    0x049b0,
    0x0a974,
    0x0a4b0,
    0x0b27a,
    0x06a50,
    0x06d40,
    0x0af46,
    0x0ab60,
    0x09570, // 1980-1989

    0x04af5,
    0x04970,
    0x064b0,
    0x074a3,
    0x0ea50,
    0x06b58,
    0x05ac0,
    0x0ab60,
    0x096d5,
    0x092e0, // 1990-1999

    0x0c960,
    0x0d954,
    0x0d4a0,
    0x0da50,
    0x07552,
    0x056a0,
    0x0abb7,
    0x025d0,
    0x092d0,
    0x0cab5, // 2000-2009

    0x0a950,
    0x0b4a0,
    0x0baa4,
    0x0ad50,
    0x055d9,
    0x04ba0,
    0x0a5b0,
    0x15176,
    0x052b0,
    0x0a930, // 2010-2019

    0x07954,
    0x06aa0,
    0x0ad50,
    0x05b52,
    0x04b60,
    0x0a6e6,
    0x0a4e0,
    0x0d260,
    0x0ea65,
    0x0d530, // 2020-2029

    0x05aa0,
    0x076a3,
    0x096d0,
    0x04afb,
    0x04ad0,
    0x0a4d0,
    0x1d0b6,
    0x0d250,
    0x0d520,
    0x0dd45, // 2030-2039

    0x0b5a0,
    0x056d0,
    0x055b2,
    0x049b0,
    0x0a577,
    0x0a4b0,
    0x0aa50,
    0x1b255,
    0x06d20,
    0x0ada0, // 2040-2049

    0x14b63,
    0x09370,
    0x049f8,
    0x04970,
    0x064b0,
    0x168a6,
    0x0ea50,
    0x06b20,
    0x1a6c4,
    0x0aae0, // 2050-2059

    0x0a2e0,
    0x0d2e3,
    0x0c960,
    0x0d557,
    0x0d4a0,
    0x0da50,
    0x05d55,
    0x056a0,
    0x0a6d0,
    0x055d4, // 2060-2069

    0x052d0,
    0x0a9b8,
    0x0a950,
    0x0b4a0,
    0x0b6a6,
    0x0ad50,
    0x055a0,
    0x0aba4,
    0x0a5b0,
    0x052b0, // 2070-2079

    0x0b273,
    0x06930,
    0x07337,
    0x06aa0,
    0x0ad50,
    0x14b55,
    0x04b60,
    0x0a570,
    0x054e4,
    0x0d160, // 2080-2089

    0x0e968,
    0x0d520,
    0x0daa0,
    0x16aa6,
    0x056d0,
    0x04ae0,
    0x0a9d4,
    0x0a2d0,
    0x0d150,
    0x0f252, // 2090-2099

    0x0d520,
  ]; // 2100

  public solarMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Number of days in a leap month in lunar year y
  public leapDays(y: number) {
    if (this.leapMonth(y)) {
      return this.lunarInfo[y - 1900] & 0x10000 ? 30 : 29;
    }
    return 0;
  }

  // Returns the month of the leap month in lunar year y
  public leapMonth(y: number) {
    // 闰字编码 \u95f0
    return this.lunarInfo[y - 1900] & 0xf;
  }

  // Total number of days in lunar year y
  public lYearDays(y: number) {
    let i;
    let sum = 348;
    for (i = 0x8000; i > 0x8; i >>= 1) {
      sum += this.lunarInfo[y - 1900] & i ? 1 : 0;
    }
    return sum + this.leapDays(y);
  }

  // Number of days in lunar month m of lunar year y (non-leap month)
  public monthDays(y: number, m: number) {
    if (m > 12 || m < 1) {
      return -1;
    } // Month parameter from 1 to 12, error return -1
    return this.lunarInfo[y - 1900] & (0x10000 >> m) ? 30 : 29;
  }

  public solar2lunar(y: number, m: number, d: number) {
    // Parameter range 1900.1.31~2100.12.31

    // Year limit, upper limit
    if (y < 1900 || y > 2100) {
      return -1; // undefined converts to NaN
    }

    // Gregorian parameter lower limit
    if (y === 1900 && m === 1 && d < 31) {
      return -1;
    }

    // Get current date if no parameters are passed
    let objDate = null;

    if (!y) {
      objDate = new Date();
    } else {
      objDate = new Date(y, m - 1, d);
    }

    let i;
    let leap = 0;
    let temp = 0;

    // Correct ymd parameters
    y = objDate.getFullYear();
    m = objDate.getMonth() + 1;
    d = objDate.getDate();

    let offset =
      (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) -
        Date.UTC(1900, 0, 31)) /
      86400000;

    for (i = 1900; i < 2101 && offset > 0; i++) {
      temp = this.lYearDays(i);
      offset -= temp;
    }

    if (offset < 0) {
      offset += temp;
      i--;
    }

    // Check if today
    const isTodateObject = new Date();
    let isToday = false;

    if (
      isTodateObject.getFullYear() === y &&
      isTodateObject.getMonth() + 1 === m &&
      isTodateObject.getDate() === d
    ) {
      isToday = true;
    }

    // Day of the week
    let nWeek = objDate.getDay();

    // Number represents day of the week, conforming to the convention that Sunday starts
    if (nWeek === 0) {
      nWeek = 7;
    }

    // Lunar year
    const year = i;
    leap = this.leapMonth(i); // Leap month
    let isLeap = false;

    // Validate leap month
    for (i = 1; i < 13 && offset > 0; i++) {
      // Leap month
      if (leap > 0 && i === leap + 1 && isLeap === false) {
        --i;

        isLeap = true;
        temp = this.leapDays(year); // Calculate the number of days in the lunar leap month
      } else {
        temp = this.monthDays(year, i); // Calculate the number of days in the lunar normal month
      }

      // Remove leap month
      if (isLeap === true && i === leap + 1) {
        isLeap = false;
      }
      offset -= temp;
    }

    // Leap month causes array index overlap to be reversed
    if (offset === 0 && leap > 0 && i === leap + 1) {
      if (isLeap) {
        isLeap = false;
      } else {
        isLeap = true;
        --i;
      }
    }

    if (offset < 0) {
      offset += temp;
      --i;
    }

    // Lunar month
    const month = i;

    // Lunar day
    const day = offset + 1;

    return {
      isToday,
      lYear: year,
      lMonth: month,
      lDay: day,
      cYear: y,
      cMonth: m,
      cDay: d,
    };
  }
}
