"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
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
    getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid)))
      .then(snap => { setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user, loading]);

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 2 }}>SELLER</div>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">الطلبات</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginTop: 12, scrollbarWidth: "none" }}>
          {TABS.map(t => (
            <button key={t.val} onClick={() => setTab(t.val)}
              style={{ padding: "7px 14px", borderRadius: 50, border: "none", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 12, transition: "all 0.2s", background: tab === t.val ? "rgba(201,169,110,0.15)" : "transparent", color: tab === t.val ? "var(--gold3)" : "var(--text3)", flexShrink: 0 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <div className="empty-text">لا توجد طلبات</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(order => {
              const s = STATUS[order.status] || STATUS.pending;
              const startDate = order.startDate?.seconds ? new Date(order.startDate.seconds * 1000).toLocaleDateString("ar-BH", { day: "numeric", month: "short" }) : "—";
              const endDate   = order.endDate?.seconds   ? new Date(order.endDate.seconds   * 1000).toLocaleDateString("ar-BH", { day: "numeric", month: "short" }) : "—";
              return (
                <div key={order.id} className="card" style={{ borderColor: order.status === "pending" ? "rgba(212,136,10,0.2)" : undefined }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                    <span style={{ fontSize: 11, color: "var(--text4)", fontFamily: "monospace" }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--gold3)" }}>{order.sellerAmount || 0} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></div>
                      <div style={{ fontSize: 10, color: "var(--text4)" }}>أرباحك</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{order.customerName || "زبونة"}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>{startDate} ← {endDate}</div>
                    </div>
                  </div>

                  {order.size && (
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 11, color: "var(--text3)", padding: "3px 10px", borderRadius: 20, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                        مقاس {order.size}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <SellerNav />
    </div>
  );
}
