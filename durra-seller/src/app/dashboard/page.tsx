"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SellerNav from "@/components/SellerNav";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "انتظار",  color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  confirmed: { label: "مؤكد",   color: "#34D399", bg: "rgba(52,211,153,0.15)" },
  active:    { label: "نشط",    color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
  completed: { label: "مكتمل",  color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)" },
  cancelled: { label: "ملغي",   color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
};

export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, earnings: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const snap = await getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc")));
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const completed = orders.filter((o: any) => o.status === "completed");
      const earnings = completed.reduce((s: number, o: any) => s + (o.sellerAmount || 0), 0);
      setStats({ total: orders.length, pending: orders.filter((o: any) => o.status === "pending").length, completed: completed.length, earnings });
      setRecentOrders(orders.slice(0, 5));
      setFetching(false);
    };
    fetchAll();
  }, [user]);

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* Header */}
      <div style={{ padding: "56px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(201,169,110,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18 }}>👗</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, color: "#C9A96E" }}>درّة</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>مرحباً، {user?.displayName}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "إجمالي الطلبات", value: stats.total, icon: "📦", color: "#60A5FA" },
          { label: "طلبات معلّقة", value: stats.pending, icon: "⏳", color: "#F59E0B" },
          { label: "طلبات مكتملة", value: stats.completed, icon: "✅", color: "#34D399" },
          { label: "أرباحي (د.ب)", value: stats.earnings.toFixed(2), icon: "💰", color: "#C9A96E" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: "18px 16px" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ padding: "0 20px", marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { href: "/dresses/new", icon: "➕", label: "إضافة فستان" },
            { href: "/calendar",    icon: "📅", label: "التقويم" },
            { href: "/waitlist",    icon: "⏳", label: "قائمة الانتظار" },
            { href: "/report",      icon: "📊", label: "التقرير" },
            { href: "/subscription",icon: "💎", label: "اشتراكي" },
            { href: "/settings",    icon: "⚙️", label: "الإعدادات" },
          ].map(item => (
            <Link href={item.href} key={item.label} style={{ textDecoration: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{item.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Link href="/orders" style={{ textDecoration: "none", fontSize: 12, color: "#C9A96E", fontWeight: 600 }}>عرض الكل ‹</Link>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>آخر الطلبات</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recentOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>لا توجد طلبات بعد</div>
            </div>
          ) : recentOrders.map((order: any) => {
            const s = STATUS[order.status] || STATUS.pending;
            return (
              <Link href={`/orders`} key={order.id} style={{ textDecoration: "none" }}>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.07)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: "#C9A96E", fontWeight: 700 }}>{order.sellerAmount} د.ب</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <SellerNav />
    </div>
  );
}
