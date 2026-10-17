const TZ = 'Asia/Kolkata';
export const today = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
export const dayStart = (d: string) => new Date(`${d}T00:00:00+05:30`);
export const dayEnd = (d: string) => new Date(`${d}T23:59:59.999+05:30`);
export const istRange = (from?: string, to?: string) => ({
  start: dayStart(from || today()),
  end: dayEnd(to || today()),
});