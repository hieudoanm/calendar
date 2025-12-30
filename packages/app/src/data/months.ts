export const months = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(0, i).toLocaleString('default', { month: 'long' });
  const quarter: number = Math.ceil((i + 1) / 3);
  return { quarter, month, monthIndex: i };
});

export const quarters: number[] = [
  ...new Set(months.map(({ quarter }) => quarter)),
];

export const monthsByQuarters = quarters.map((quarterValue) => {
  const monthsByQuarter = months.filter(
    ({ quarter }) => quarter === quarterValue
  );
  return { quarter: quarterValue, months: monthsByQuarter };
});
