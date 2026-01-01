export const years = Array.from({ length: 2100 - 1970 + 1 }, (_, i) => {
  const year = 1970 + i;
  const decade = Math.floor(year / 10) * 10;
  return { decade, year };
});

export const decades: number[] = [
  ...new Set(years.map(({ decade }) => decade)),
];

export const yearsByDecades = decades.map((decadeValue) => {
  const yearsByDecade = years.filter(({ decade }) => decade === decadeValue);
  return { decade: decadeValue, years: yearsByDecade };
});
