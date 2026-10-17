import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { startOnlinePayment } from "../../api/payments";
import { useAppDispatch, useAppSelector } from "../../store";
import { addItem, clearCart } from "../../store/cartSlice";
import { calcTotals } from "../../utils/total";
import ProductGrid from "../../components/billing/ProductGrid";
import CartPanel from "../../components/billing/CartPanel";
import ReceiptModal from "../../components/ReceiptModal";
import type { Product } from "../../types/productTypes";
import type { Sale } from "../../types/saleTypes";
import type { PayMode } from "../../types/paymentTypes";
import { useDebounce } from "../../hooks/useDebounce";
import { productApi } from "../../api/productApi";
import { errMsg } from "../../utils/apiError";
import { saleApi } from "../../api/saleApi";

export default function Billing() {
  const dispatch = useAppDispatch();
  const { items, discount } = useAppSelector((s) => s.cart);
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<PayMode>("Cash");
  const [received, setReceived] = useState("");
  const [cust, setCust] = useState({ name: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Sale | null>(null);

  const totals = useMemo(() => calcTotals(items, discount), [items, discount]);

  const dq = useDebounce(q, 250);
  const loadProducts = useCallback(async () => {
    try {
      setProducts(await productApi.list({ q: dq }));
    } catch (e) {
      toast.error(errMsg(e, "Failed to load products"));
    }
  }, [dq]);
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const checkout = async () => {
    if (!items.length) return toast.error("Cart is empty");
    if (mode === "Cash" && received && +received < totals.total)
      return toast.error("Received amount is less than total");

    setBusy(true);
    try {
      const lines = items.map((i) => ({ productId: i.productId, qty: i.qty }));
      const payment =
        mode === "Cash"
          ? undefined
          : await startOnlinePayment(lines, discount, cust);

      const data = await saleApi.create({
        items: lines,
        discount,
        paymentMode: mode,
        payment,
        amountReceived: mode === "Cash" && received ? +received : undefined,
        customerName: cust.name || undefined,
        customerPhone: cust.phone || undefined,
      });

      toast.success(`Bill ${data.billNo} created`);
      dispatch(clearCart());
      setReceived("");
      setCust({ name: "", phone: "" });
      setDone(data);
    } catch (e: any) {
      toast.error(errMsg(e, "Billing failed"));
    } finally {
      setBusy(false);
      loadProducts(); // refresh stock either way
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <ProductGrid
        products={products}
        q={q}
        onSearch={setQ}
        onAdd={(p) =>
          dispatch(
            addItem({
              productId: p._id,
              name: p.name,
              price: p.price,
              cost: p.cost,
              gst: p.gst,
              stock: p.stock,
            }),
          )
        }
      />
      <CartPanel
        totals={totals}
        mode={mode}
        onMode={setMode}
        received={received}
        onReceived={setReceived}
        cust={cust}
        onCust={setCust}
        busy={busy}
        onCheckout={checkout}
      />
      {done && <ReceiptModal sale={done} onClose={() => setDone(null)} />}
    </div>
  );
}
