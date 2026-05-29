"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SellerNav from "@/components/SellerNav";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "انتظار تأكيد", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  confirmed: { label: "مؤكد ✓",       color: "#34D399", bg: "rgba(52,211,153,0.15)" },
  active:    { label: "نشط",          color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
  completed: { label: "مكتمل",        color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)" },
  cancelled: { label: "ملغي",         color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
};

export default function SellerOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc")))
      .then(snap => { setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "bookings", id), { status });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = tab === "all" ? orders : orders.filter(o => o.status === tab);

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 16 }}>الطلبات الواردة</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14 }}>
          {[{ val: "all", label: "الكل" }, { val: "pending", label: "انتظار" }, { val: "confirmed", label: "مؤكدة" }, { val: "completed", label: "مكتملة" }].map(t => (
            <button key={t.val} onClick={() => setTab(t.val)} style={{ padding: "7px 16px", borderRadius: 50, border: "none", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 12, background: tab === t.val ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "rgba(255,255,255,0.06)", color: tab === t.val ? "#1A0E05" : "rgba(255,255,255,0.4)", transition: "all 0.2s" }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>لا توجد طلبات</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(order => {
              const s = STATUS[order.status] || STATUS.pending;
              const date = order.startDate?.seconds ? new Date(order.startDate.seconds * 1000).toLocaleDateString("ar-BH") : "—";
              return (
                <div key={order.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#C9A96E" }}>{order.sellerAmount} <span style={{ fontSize: 12 }}>د.ب</span></div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: order.status === "pending" ? "1px solid rgba(255,255,255,0.05)" : "none", marginBottom: order.status === "pending" ? 12 : 0 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{date}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>تاريخ الاستلام</span>
                  </div>
                  {order.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => updateStatus(order.id, "cancelled")} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 13, background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>رفض</button>
                      <button onClick={() => updateStatus(order.id, "confirmed")} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 13, background: "rgba(52,211,153,0.15)", color: "#34D399" }}>قبول ✓</button>
                    </div>
                  )}
                  {order.status === "confirmed" && (
                    <button onClick={() => updateStatus(order.id, "completed")} style={{ width: "100%", padding: "9px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 13, background: "rgba(96,165,250,0.15)", color: "#60A5FA" }}>تأكيد الإكمال</button>
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
