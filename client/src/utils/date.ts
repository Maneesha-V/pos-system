const TZ = 'Asia/Kolkata';
export const ymd = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ });
export const daysAgo = (n: number) => ymd(new Date(Date.now() - n * 864e5));

export function lastNDays(n: number, daily: { _id: string; total: number }[]) {
  return Array.from({ length: n }, (_, i) => {
    const key = daysAgo(n - 1 - i);
    return { key, total: daily.find((d) => d._id === key)?.total ?? 0 };
  });
}