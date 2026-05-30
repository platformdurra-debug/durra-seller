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
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid), where("status", "==", "cancelled"), orderBy("createdAt", "desc")))
      .then(snap => { setWaitlist(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user, loading]);

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 2 }}>SELLER</div>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">قائمة الانتظار</div>
        <div className="page-sub">{waitlist.length} طلب ملغي</div>
      </div>

      <div style={{ padding: "16px" }}>
        {waitlist.length === 0 ? (
          <div className="empty-state"><div className="empty-text">لا توجد طلبات ملغية</div></div>
        ) : waitlist.map(o => (
          <div key={o.id} className="card" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 10, color: "var(--text4)", fontFamily: "monospace" }}>#{o.id.slice(0, 8).toUpperCase()}</div>
              <div style={{ fontSize: 10, color: "var(--text4)", marginTop: 2 }}>{o.startDate?.seconds ? new Date(o.startDate.seconds * 1000).toLocaleDateString("ar-BH") : "—"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)" }}>{o.customerName || "زبونة"}</div>
              <span className="badge" style={{ background: "rgba(192,57,43,0.08)", color: "var(--red)", fontSize: 10 }}>ملغي</span>
            </div>
          </div>
        ))}
      </div>
      <SellerNav />
    </div>
  );
}
