"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SellerNav from "@/components/SellerNav";

export default function ReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid), where("status", "==", "completed")))
      .then(snap => { setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user, loading]);

  const now = new Date();
  const thisMonth = orders.filter(o => { const d = new Date((o.createdAt?.seconds || 0) * 1000); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const lastMonth = orders.filter(o => { const d = new Date((o.createdAt?.seconds || 0) * 1000); const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1); return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear(); });
  const thisMonthEarnings = thisMonth.reduce((s, o) => s + (o.sellerAmount || 0), 0);
  const lastMonthEarnings = lastMonth.reduce((s, o) => s + (o.sellerAmount || 0), 0);
  const growth = lastMonthEarnings > 0 ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(0) : null;

  // Bar chart data - last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0);
    const rev = orders.filter(o => o.createdAt?.seconds && new Date(o.createdAt.seconds * 1000) >= d && new Date(o.createdAt.seconds * 1000) <= end).reduce((s, o) => s + (o.sellerAmount || 0), 0);
    return { month: d.toLocaleDateString("ar-BH", { month: "short" }), rev };
  });
  const maxRev = Math.max(...months.map(m => m.rev), 1);

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 2 }}>SELLER</div>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">التقرير الشهري</div>
        <div className="page-sub">{now.toLocaleDateString("ar-BH", { month: "long", year: "numeric" })}</div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* This vs last month */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "هذا الشهر",    value: thisMonthEarnings, count: thisMonth.length, color: "var(--gold3)" },
            { label: "الشهر الماضي", value: lastMonthEarnings, count: lastMonth.length, color: "var(--text3)" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ textAlign: "center" }}>
              <div className="stat-value" style={{ color: s.color, fontSize: 20 }}>{s.value.toFixed(2)} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></div>
              <div style={{ fontSize: 11, color: "var(--text4)", marginBottom: 4 }}>{s.count} طلب</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Growth */}
        {growth !== null && (
          <div className="card" style={{ textAlign: "center", marginBottom: 20, borderColor: Number(growth) >= 0 ? "rgba(45,138,94,0.2)" : "rgba(192,57,43,0.2)", background: Number(growth) >= 0 ? "rgba(45,138,94,0.04)" : "rgba(192,57,43,0.04)" }}>
            <div style={{ fontSize: 38, fontWeight: 800, color: Number(growth) >= 0 ? "var(--green)" : "var(--red)", fontFamily: "'Playfair Display', serif" }}>
              {Number(growth) >= 0 ? "+" : ""}{growth}%
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>مقارنة بالشهر الماضي</div>
          </div>
        )}

        {/* Bar Chart */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, textAlign: "right", color: "var(--text)" }}>إيرادات آخر 6 أشهر</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
            {months.map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                  <div style={{ width: "100%", borderRadius: "6px 6px 0 0", background: i === months.length - 1 ? "linear-gradient(180deg, #C9A96E, #A07840)" : "var(--bg3)", height: `${Math.max((m.rev / maxRev) * 100, 4)}%`, position: "relative" }}>
                    {m.rev > 0 && i === months.length - 1 && (
                      <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: "var(--gold3)", fontWeight: 700, whiteSpace: "nowrap" }}>{m.rev.toFixed(0)}</div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "var(--text4)", fontWeight: 600 }}>{m.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SellerNav />
    </div>
  );
}
