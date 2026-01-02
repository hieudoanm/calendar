import { events } from '@calendar/data/events';
import { months, monthsByQuarters } from '@calendar/data/months';
import { yearsByDecades } from '@calendar/data/years';
import {
  generateFullCalendar,
  getWeekOfYear,
  LunarCalendar,
} from '@calendar/utils/calendar';
import { NextPage } from 'next';
import { useState } from 'react';

const daysOfWeek: { short: string; long: string }[] = [
  { short: 'Sun', long: 'Sunday' },
  { short: 'Mon', long: 'Monday' },
  { short: 'Tue', long: 'Tuesday' },
  { short: 'Wed', long: 'Wednesday' },
  { short: 'Thu', long: 'Thursday' },
  { short: 'Fri', long: 'Friday' },
  { short: 'Sat', long: 'Saturday' },
];

const lunarCalendar = new LunarCalendar();

const getEvents = (today: Date) => {
  return events.filter(({ year = 0, month = 0, date = 0, frequency }) => {
    const isTodayYear: boolean =
      year === 0 || frequency === 'annual'
        ? true
        : year === today.getFullYear();
    const isTodayMonth: boolean =
      month === 0 ? true : month === today.getMonth() + 1;
    const isTodayDate: boolean = date === 0 ? true : date === today.getDate();
    const isTodayEvent: boolean = isTodayYear && isTodayMonth && isTodayDate;
    return isTodayEvent;
  });
};

const HomePage: NextPage = () => {
  const today = new Date();
  const [chosenDate, setChosenDate] = useState(today);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const calendar = generateFullCalendar(year, month);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-base-200 flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col gap-y-2 md:gap-y-4">
        {getEvents(chosenDate).length > 0 && (
          <div className="flex flex-col gap-y-2 md:gap-y-4">
            {getEvents(chosenDate).map(
              ({ year = 0, month = 0, date = 0, title = '' }, index = 0) => {
                return (
                  <div
                    key={`${year}-${month}-${date}-${index}`}
                    role="alert"
                    className="alert alert-info">
                    {date}/{month} - {title}
                  </div>
                );
              }
            )}
          </div>
        )}
        <div className="bg-base-100 w-full max-w-fit rounded-lg p-4 shadow-lg">
          {/* Month & Year Select */}
          <div className="mb-4 flex justify-center gap-2">
            <button className="btn btn-primary" onClick={handlePrevMonth}>
              &lt; Prev
            </button>

            <select
              className="select select-bordered"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}>
              {monthsByQuarters.map(({ quarter, months = [] }) => (
                <optgroup key={quarter} label={`Q${quarter}`}>
                  {months.map(({ monthIndex, month }) => (
                    <option key={month} value={monthIndex}>
                      {month}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <select
              className="select select-bordered"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}>
              {yearsByDecades.map(({ decade = 0, years = [] }) => (
                <optgroup key={decade} label={`${decade}s`}>
                  {years.map(({ year }) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <button className="btn btn-primary" onClick={handleNextMonth}>
              Next &gt;
            </button>
          </div>

          <table className="table-zebra table w-full">
            <thead>
              <tr>
                <th className="w-12 p-2 text-center">Week</th>
                {daysOfWeek.map(({ short }) => (
                  <th key={short} className="p-2 text-center">
                    {short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendar.map((week, i) => {
                // Find the first actual date in the week
                const firstDay = week.find((d) => d.currentMonth !== undefined);

                let weekNumber = '';
                if (firstDay) {
                  let y = year;
                  let m = month;

                  if (firstDay.currentMonth === 'previous') {
                    m = month - 1;
                    if (m < 0) {
                      m = 11;
                      y--;
                    }
                  } else if (firstDay.currentMonth === 'next') {
                    m = month + 1;
                    if (m > 11) {
                      m = 0;
                      y++;
                    }
                  }

                  weekNumber = getWeekOfYear(
                    new Date(y, m, firstDay.date)
                  ).toString();
                }

                return (
                  <tr key={i}>
                    {/* Week number column */}
                    <td className="p-4 text-center font-semibold text-gray-500">
                      {weekNumber}
                    </td>

                    {week.map((dateObject, j) => {
                      if (!dateObject) return <td key={j} className="p-4"></td>;

                      const { date, currentMonth } = dateObject;

                      let m = month + 1;
                      if (currentMonth === 'previous') m = month;
                      else if (currentMonth === 'next')
                        m = month + 2 > 12 ? 1 : month + 2;

                      const lunarDate = lunarCalendar.solar2lunar(
                        year,
                        m,
                        date
                      );
                      const lunarDay = lunarDate === -1 ? 0 : lunarDate.lDay;
                      const lunarMonth =
                        lunarDate === -1 ? 0 : lunarDate.lMonth;

                      const isToday =
                        currentMonth === 'current' &&
                        date === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear();

                      const toDate = new Date(year, month, date);
                      const toDateEvents = getEvents(toDate);

                      const toDateClass: string = isToday
                        ? 'text-secondary'
                        : '';
                      const notCurrentMonthClass: string =
                        currentMonth !== 'current' ? 'text-base-300' : '';
                      const hasEventsClass: string =
                        !isToday &&
                        currentMonth === 'current' &&
                        toDateEvents.length > 0
                          ? 'text-primary'
                          : '';
                      const toDateClassName =
                        `${toDateClass} ${notCurrentMonthClass} ${hasEventsClass}`.trim();

                      return (
                        <td key={j} className="relative">
                          {currentMonth === 'current' && (
                            <div className="absolute top-1 right-1 text-xs text-gray-500">
                              {lunarDay}
                              {lunarDay === 1 ? `/${lunarMonth}` : ''}
                            </div>
                          )}

                          <button
                            className={`${currentMonth !== 'current' ? 'text-gray-500' : ''} ${toDateClassName} btn btn-ghost btn-xs`}
                            onClick={() => {
                              setChosenDate(toDate);
                            }}>
                            {date}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2 className="mt-4 text-center text-xl font-bold">
            {daysOfWeek.at(chosenDate.getDay())?.long}, {months[month].month}{' '}
            {chosenDate.getDate()}, {year}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
