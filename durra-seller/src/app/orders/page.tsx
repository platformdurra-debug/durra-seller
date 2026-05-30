"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SellerNav from "@/components/SellerNav";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "انتظار تأكيد", color: "#D4880A", bg: "rgba(212,136,10,0.1)" },
  confirmed: { label: "مؤكد",         color: "#2D8A5E", bg: "rgba(45,138,94,0.1)" },
  active:    { label: "نشط",          color: "#2A6BAD", bg: "rgba(42,107,173,0.1)" },
  completed: { label: "مكتمل",        color: "#8C6840", bg: "rgba(140,104,64,0.1)" },
  cancelled: { label: "ملغي",         color: "#C0392B", bg: "rgba(192,57,43,0.1)" },
};

export default function SellerOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc")))
      .then(snap => { setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user, loading]);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "bookings", id), { status });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const TABS = [
    { val: "all",       label: `الكل (${orders.length})` },
    { val: "pending",   label: `انتظار (${orders.filter(o => o.status === "pending").length})` },
    { val: "confirmed", label: "مؤكدة" },
    { val: "completed", label: "مكتملة" },
  ];

  const filtered = tab === "all" ? orders : orders.filter(o => o.status === tab);

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 2 }}>SELLER</div>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">الطلبات الواردة</div>
        <div className="page-sub">{orders.length} طلب إجمالي</div>
      </div>

      <div style={{ padding: "16px" }}>
        <div className="tabs" style={{ marginBottom: 16 }}>
          {TABS.map(t => (
            <button key={t.val} className={`tab-btn ${tab === t.val ? "active" : ""}`} onClick={() => setTab(t.val)}>{t.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-text">لا توجد طلبات</div></div>
          ) : filtered.map(order => {
            const s = STATUS[order.status] || STATUS.pending;
            const date = order.startDate?.seconds ? new Date(order.startDate.seconds * 1000).toLocaleDateString("ar-BH") : "—";
            return (
              <div key={order.id} className="card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "var(--text4)", fontFamily: "monospace", marginBottom: 2 }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--gold3)" }}>{order.sellerAmount} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid var(--border)", marginBottom: order.status === "pending" || order.status === "confirmed" ? 12 : 0 }}>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>{date}</span>
                  <span style={{ fontSize: 11, color: "var(--text4)" }}>تاريخ الاستلام</span>
                </div>
                {order.status === "pending" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => updateStatus(order.id, "cancelled")} className="btn-danger">رفض</button>
                    <button onClick={() => updateStatus(order.id, "confirmed")} className="btn-success">قبول ✓</button>
                  </div>
                )}
                {order.status === "confirmed" && (
                  <button onClick={() => updateStatus(order.id, "completed")} className="btn-ghost" style={{ width: "100%" }}>تأكيد الإكمال</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <SellerNav />
    </div>
  );
}
