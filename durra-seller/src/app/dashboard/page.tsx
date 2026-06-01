"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SellerNav from "@/components/SellerNav";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "انتظار",  color: "#D4880A", bg: "rgba(212,136,10,0.1)" },
  confirmed: { label: "مؤكد",   color: "#2D8A5E", bg: "rgba(45,138,94,0.1)" },
  active:    { label: "نشط",    color: "#2A6BAD", bg: "rgba(42,107,173,0.1)" },
  completed: { label: "مكتمل",  color: "#8C6840", bg: "rgba(140,104,64,0.1)" },
  cancelled: { label: "ملغي",   color: "#C0392B", bg: "rgba(192,57,43,0.1)" },
};

const QUICK_LINKS = [
  { href: "/dresses/new", label: "إضافة فستان",
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
  { href: "/calendar", label: "التقويم",
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { href: "/notifications", label: "إشعاراتي",
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { href: "/subscription", label: "اشتراكي",
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { href: "/settings", label: "الإعدادات",
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, earnings: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc")))
      .then(snap => {
        const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const completed = orders.filter((o: any) => o.status === "completed");
        setStats({ total: orders.length, pending: orders.filter((o: any) => o.status === "pending").length, completed: completed.length, earnings: completed.reduce((s: number, o: any) => s + (o.sellerAmount || 0), 0) });
        setRecentOrders(orders.slice(0, 5));
        setFetching(false);
      }).catch(() => setFetching(false));
  }, [user, loading]);

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="logo-text">درّة ✦</div>
            <div style={{ fontSize: 11, color: "rgba(201,169,110,0.45)", marginTop: 2 }}>مرحباً، {user?.displayName}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "إجمالي الطلبات", value: stats.total,               color: "var(--text)" },
            { label: "طلبات معلّقة",   value: stats.pending,             color: "var(--yellow)" },
            { label: "طلبات مكتملة",   value: stats.completed,           color: "var(--green)" },
            { label: "أرباحي (د.ب)",   value: stats.earnings.toFixed(2), color: "var(--gold3)" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
          {QUICK_LINKS.map(item => (
            <Link href={item.href} key={item.label} style={{ textDecoration: "none" }}>
              <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", padding: "16px 10px", textAlign: "center", transition: "all 0.2s" }}>
                <div style={{ color: "var(--gold3)", marginBottom: 6, display: "flex", justifyContent: "center" }}>{item.svg}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)", fontFamily: "Tajawal" }}>{item.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Link href="/orders" style={{ textDecoration: "none", fontSize: 12, color: "var(--gold3)", fontWeight: 700 }}>عرض الكل ←</Link>
          <div className="section-title" style={{ marginBottom: 0 }}>آخر الطلبات</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recentOrders.length === 0 ? (
            <div className="empty-state"><div className="empty-text">لا توجد طلبات بعد</div></div>
          ) : recentOrders.map((order: any) => {
            const s = STATUS[order.status] || STATUS.pending;
            return (
              <div key={order.id} className="card" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--gold3)" }}>{order.sellerAmount} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text4)", fontFamily: "monospace" }}>#{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      </div>
      <SellerNav />
    </div>
  );
}
