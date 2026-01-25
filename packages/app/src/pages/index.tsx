import { events, Event } from '@calendar/data/events';
import { months, monthsByQuarters } from '@calendar/data/months';
import { yearsByDecades } from '@calendar/data/years';
import {
  generateFullCalendar,
  getWeekOfYear,
  LunarCalendar,
} from '@calendar/utils/calendar';
import { NextPage } from 'next';
import Link from 'next/link';
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

const getEvents = (
  today: Date,
  { groupBy = '' }: { groupBy: string } = {
    groupBy: '',
  }
) => {
  const filteredEvents = events.filter(
    ({ year = 0, month = 0, date = 0, frequency = '' }) => {
      const isTodayYear: boolean =
        year === 0 || frequency === 'annual'
          ? true
          : year === today.getFullYear();
      const isTodayMonth: boolean =
        month === 0 ? true : month === today.getMonth() + 1;
      const isTodayDate: boolean = date === 0 ? true : date === today.getDate();
      const isTodayEvent: boolean = isTodayYear && isTodayMonth && isTodayDate;
      return isTodayEvent;
    }
  );

  const groups: string[] =
    groupBy === ''
      ? []
      : [
          ...new Set(
            filteredEvents.map((event) =>
              (event[groupBy as keyof Event] ?? '').toString()
            )
          ),
        ];
  groups.sort((a, b) => (a > b ? 1 : -1));

  const eventByGroups =
    groups.length > 0
      ? groups.map((group: string) => {
          const eventsByGroup = filteredEvents.filter(
            (event) => event[groupBy as keyof Event] === group
          );
          return { group, events: eventsByGroup };
        })
      : [{ group: '', events: filteredEvents }];

  return { total: filteredEvents.length, events: eventByGroups };
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

  const prefix = 'field';

  return (
    <div className="flex flex-col gap-y-4 p-4 md:gap-y-8 md:p-8">
      <nav className="navbar bg-neutral text-neutral-content border-base-300/50 rounded-full border px-4 shadow-xl md:px-8">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl font-bold">
            Calendar
          </Link>
        </div>
        <div className="flex-none">
          <Link href="/tasks" className="btn btn-ghost">
            Tasks
          </Link>
        </div>
      </nav>

      <main className="flex h-full w-full flex-col gap-y-2 md:gap-y-4">
        <div className="bg-neutral border-base-300 w-full rounded-4xl border p-4 shadow-2xl">
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
              onChange={(e) => setYear(Number.parseInt(e.target.value, 10))}>
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

          <table className="table w-full">
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

                      let toDate = new Date(year, month, date);
                      if (currentMonth === 'previous') {
                        toDate = new Date(year, month - 1, date);
                      } else if (currentMonth === 'next') {
                        toDate = new Date(year, month + 1, date);
                      }

                      const toDateEvents = getEvents(toDate);

                      const toDateClass: string = isToday
                        ? 'text-secondary'
                        : '';
                      const notCurrentMonthClass: string =
                        currentMonth === 'current' ? '' : 'text-base-300';
                      const hasEventsClass: string =
                        !isToday &&
                        currentMonth === 'current' &&
                        toDateEvents.total > 0
                          ? 'text-primary'
                          : '';
                      const toDateClassName =
                        `${toDateClass} ${notCurrentMonthClass} ${hasEventsClass}`.trim();

                      return (
                        <td key={`row-${j}`} className="align-top">
                          <div className="flex h-full flex-col">
                            <div className="flex items-center justify-between">
                              <button
                                className={`${currentMonth === 'current' ? '' : 'text-gray-500'} ${toDateClassName} btn btn-ghost btn-xs`}
                                onClick={() => {
                                  setChosenDate(toDate);
                                }}>
                                {date}
                              </button>
                              {currentMonth === 'current' && (
                                <div className="text-xs text-gray-500">
                                  {lunarDay}
                                  {lunarDay === 1 ? `/${lunarMonth}` : ''}
                                </div>
                              )}
                            </div>
                            <div className="hidden md:block">
                              {getEvents(toDate).total > 0 && (
                                <div className="flex flex-col gap-y-2 md:gap-y-4">
                                  {getEvents(toDate).events.map(
                                    ({ group = '', events = [] }) => {
                                      return (
                                        <>
                                          {group && <p>{group}</p>}
                                          {events.map((event, index = 0) => {
                                            const {
                                              year = 0,
                                              month = 0,
                                              date = 0,
                                              title = '',
                                            } = event;
                                            const prefixValue =
                                              event[prefix as keyof Event];
                                            return (
                                              <div
                                                key={`${year}-${month}-${date}-${index}`}
                                                role="alert"
                                                className="alert alert-info text-xs">
                                                {date}/{month} - [{prefixValue}]{' '}
                                                {title}
                                              </div>
                                            );
                                          })}
                                        </>
                                      );
                                    }
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
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
      </main>
    </div>
  );
};

export default HomePage;
