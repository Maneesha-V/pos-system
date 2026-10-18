import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Modal from './Modal';
import type { Sale } from '../types/saleTypes';
import { payLabel } from '../utils/format';

const inr = (n: number) => '₹' + n.toFixed(2);

export default function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({ contentRef: ref, documentTitle: sale.billNo });

  return (
    <Modal title={`Bill ${sale.billNo}`} onClose={onClose}>
      <div ref={ref} className="font-mono text-xs leading-5 text-black">
        <div className="text-center">
          <div className="text-sm font-bold">TEXTILE STORE</div>
          <div>Tax Invoice</div>
        </div>
        <hr className="my-2 border-dashed" />
        <div>Bill: {sale.billNo}</div>
        <div>{new Date(sale.createdAt).toLocaleString()}</div>
        <div>Cashier: {sale.staffName}</div>
        {sale.customerName && <div>Customer: {sale.customerName} {sale.customerPhone}</div>}
        <hr className="my-2 border-dashed" />
        {sale.items.map((i) => (
          <div key={i._id} className="mb-1">
            <div>{i.name}</div>
            <div className="flex justify-between">
              <span>{i.qty} x {i.price.toFixed(2)} (GST {i.gst}%)</span>
              <span>{(i.qty * i.price).toFixed(2)}</span>
            </div>
          </div>
        ))}
        <hr className="my-2 border-dashed" />
        <div className="flex justify-between"><span>Subtotal</span><span>{sale.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>GST</span><span>{sale.tax.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>-{sale.discount.toFixed(2)}</span></div>
        <div className="flex justify-between text-sm font-bold"><span>TOTAL</span><span>{inr(sale.total)}</span></div>
        <div>Paid by {payLabel(sale)}</div>   
        {sale.paymentMode === 'Cash' && sale.amountReceived > sale.total && (
          <div>Received {inr(sale.amountReceived)} · Change {inr(sale.amountReceived - sale.total)}</div>
        )}
        <hr className="my-2 border-dashed" />
        <div className="text-center">Thank you! Visit again</div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => print()} className="flex-1 rounded-lg bg-indigo-600 p-2 text-white">Print</button>
        <button onClick={onClose} className="flex-1 rounded-lg border p-2">Close</button>
      </div>
    </Modal>
  );
}