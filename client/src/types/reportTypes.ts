export interface Summary {
  sales: { total: number; count: number };
  returns: { total: number; count: number };
  purchases: number; payments: number; expenses: number;
  grossProfit: number; netProfit: number;
  byStaff: { _id: string; total: number; count: number }[];
  topProducts: { _id: string; qty: number; revenue: number }[];
  daily: { _id: string; total: number; count: number }[];
  lowStock: number; payable: number;
}
export interface LedgerRow {
  _id: string; type: string; description: string;
  debit: number; credit: number; createdAt: string;
}