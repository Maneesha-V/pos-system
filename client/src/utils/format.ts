export const inr = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const payLabel = (s: { paymentMode: string; paymentMethod?: string }) =>
  s.paymentMode === 'Online' && s.paymentMethod ? `Online (${s.paymentMethod.toUpperCase()})` : s.paymentMode;