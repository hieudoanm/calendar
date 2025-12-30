import {
  generateFullCalendar,
  getWeekOfYear,
  LunarCalendar,
} from '@lunar/utils/calendar';
import { NextPage } from 'next';
import { useState } from 'react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const lunarCalendar = new LunarCalendar();

const HomePage: NextPage = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const calendar = generateFullCalendar(year, month);

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString('default', { month: 'long' }),
  );

  const years = Array.from({ length: 2100 - 1970 + 1 }, (_, i) => 1970 + i);

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
      <div className="bg-base-100 w-full max-w-md rounded-lg p-4 shadow-lg">
        {/* Month & Year Select */}
        <div className="mb-4 flex justify-center gap-2">
          <button className="btn btn-primary" onClick={handlePrevMonth}>
            &lt; Prev
          </button>

          <select
            className="select select-bordered"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}>
            {months.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
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
              {daysOfWeek.map((day) => (
                <th key={day} className="p-2 text-center">
                  {day}
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
                  new Date(y, m, firstDay.date),
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

                    const lunarDate = lunarCalendar.solar2lunar(year, m, date);
                    const lunarDay = lunarDate === -1 ? 0 : lunarDate.lDay;
                    const lunarMonth = lunarDate === -1 ? 0 : lunarDate.lMonth;

                    const isToday =
                      currentMonth === 'current' &&
                      date === today.getDate() &&
                      month === today.getMonth() &&
                      year === today.getFullYear();

                    return (
                      <td
                        key={j}
                        className={`relative p-4 text-center ${
                          isToday ? 'text-secondary rounded-xl font-bold' : ''
                        }`}>
                        {currentMonth === 'current' && (
                          <div className="absolute top-1 right-1 text-xs text-gray-500">
                            {lunarDay}
                            {lunarDay === 1 ? `/${lunarMonth}` : ''}
                          </div>
                        )}

                        <span
                          className={
                            currentMonth !== 'current' ? 'text-gray-500' : ''
                          }>
                          {date}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        <h2 className="mt-4 text-center text-xl font-bold">
          {months[month]} {year}
        </h2>
      </div>
    </div>
  );
};

export default HomePage;
