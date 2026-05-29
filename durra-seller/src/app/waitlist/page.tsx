"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SellerNav from "@/components/SellerNav";

export default function WaitlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid), where("status", "==", "cancelled"), orderBy("createdAt", "desc")))
      .then(snap => { setWaitlist(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", textAlign: "center" }}>قائمة الانتظار</div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {waitlist.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>لا توجد طلبات ملغية</div>
          </div>
        ) : waitlist.map(o => (
          <div key={o.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.07)", padding: "14px 18px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>#{o.id.slice(0, 8).toUpperCase()}</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{o.customerName || "زبونة"}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{o.startDate?.seconds ? new Date(o.startDate.seconds * 1000).toLocaleDateString("ar-BH") : "—"}</div>
            </div>
          </div>
        ))}
      </div>
      <SellerNav />
    </div>
  );
}
