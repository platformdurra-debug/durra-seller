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
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid), where("status", "==", "completed")))
      .then(snap => { setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

  const now = new Date();
  const thisMonth = orders.filter(o => { const d = new Date((o.createdAt?.seconds || 0) * 1000); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const lastMonth = orders.filter(o => { const d = new Date((o.createdAt?.seconds || 0) * 1000); const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1); return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear(); });
  const thisMonthEarnings = thisMonth.reduce((s, o) => s + (o.sellerAmount || 0), 0);
  const lastMonthEarnings = lastMonth.reduce((s, o) => s + (o.sellerAmount || 0), 0);
  const growth = lastMonthEarnings > 0 ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(0) : 0;

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", textAlign: "center" }}>التقرير الشهري</div>
      </div>
      <div style={{ padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "هذا الشهر", value: `${thisMonthEarnings.toFixed(2)} د.ب`, count: thisMonth.length, color: "#C9A96E" },
            { label: "الشهر الماضي", value: `${lastMonthEarnings.toFixed(2)} د.ب`, count: lastMonth.length, color: "rgba(255,255,255,0.4)" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>{s.count} طلب</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {lastMonthEarnings > 0 && (
          <div style={{ background: Number(growth) >= 0 ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)", borderRadius: 18, border: `1px solid ${Number(growth) >= 0 ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`, padding: "16px 20px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: Number(growth) >= 0 ? "#34D399" : "#EF4444" }}>{Number(growth) >= 0 ? "+" : ""}{growth}%</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>مقارنة بالشهر الماضي</div>
          </div>
        )}
      </div>
      <SellerNav />
    </div>
  );
}
