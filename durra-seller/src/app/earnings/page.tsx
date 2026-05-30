"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SellerNav from "@/components/SellerNav";

export default function EarningsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid), where("status", "==", "completed"), orderBy("createdAt", "desc")))
      .then(snap => { setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user, loading]);

  const total = orders.reduce((s, o) => s + (o.sellerAmount || 0), 0);
  const now = new Date();
  const thisMonth = orders.filter(o => {
    const d = new Date((o.createdAt?.seconds || 0) * 1000);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, o) => s + (o.sellerAmount || 0), 0);

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div style={{ background: "linear-gradient(150deg, #1A0E02, #3D2208)", padding: "52px 20px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, background: "radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 3, marginBottom: 16 }}>إجمالي الأرباح</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700, color: "#C9A96E", lineHeight: 1 }}>{total.toFixed(2)}</div>
        <div style={{ fontSize: 13, color: "rgba(201,169,110,0.5)", marginTop: 6 }}>دينار بحريني</div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderColor: "rgba(201,169,110,0.2)" }}>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>هذا الشهر</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--green)" }}>{thisMonth.toFixed(2)} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></div>
        </div>

        <div className="section-title">سجل الأرباح ({orders.length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {orders.length === 0 ? (
            <div className="empty-state"><div className="empty-text">لا توجد أرباح بعد</div></div>
          ) : orders.map(o => (
            <div key={o.id} className="card" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 10, color: "var(--text4)", fontFamily: "monospace" }}>{new Date((o.createdAt?.seconds || 0) * 1000).toLocaleDateString("ar-BH")}</div>
                <div style={{ fontSize: 10, color: "var(--text4)", fontFamily: "monospace", marginTop: 2 }}>#{o.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--gold3)" }}>{o.sellerAmount} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></div>
            </div>
          ))}
        </div>
      </div>
      <SellerNav />
    </div>
  );
}
