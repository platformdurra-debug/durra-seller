"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SellerNav from "@/components/SellerNav";

export default function DressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dresses, setDresses] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "dresses"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc")))
      .then(snap => { setDresses(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user, loading]);

  const toggleAvailable = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "dresses", id), { available: !current });
    setDresses(prev => prev.map(d => d.id === id ? { ...d, available: !current } : d));
  };

  const withdrawDress = async (dress: any) => {
    // تحقق: ما في حجوزات نشطة على الفستان
    const activeBookings = await getDocs(query(
      collection(db, "bookings"),
      where("dressId", "==", dress.id),
      where("status", "in", ["confirmed", "active"])
    ));
    if (!activeBookings.empty) {
      alert("لا يمكن سحب الفستان — يوجد حجز نشط عليه حالياً. انتظري حتى انتهاء الحجز.");
      return;
    }
    if (!confirm("هل تريدين سحب هذا الفستان نهائياً من المنصة؟ سيتم إبلاغ المستودع لإعادته لك.")) return;

    setWithdrawing(dress.id);
    try {
      // إشعار للمستودع/الأدمن لإرجاع الفستان
      await addDoc(collection(db, "notifications"), {
        userId: "admin",
        type: "dress_withdrawal",
        title: "📤 طلب سحب فستان",
        body: (dress.sellerName || "معرِضة") + " طلبت سحب فستان: " + dress.name,
        dressId: dress.id,
        read: false,
        createdAt: serverTimestamp(),
      });
      // احذف الفستان من العرض
      await deleteDoc(doc(db, "dresses", dress.id));
      setDresses(prev => prev.filter(d => d.id !== dress.id));
      alert("تم تقديم طلب السحب. سيتواصل معك المستودع لإعادة الفستان.");
    } finally {
      setWithdrawing(null);
    }
  };

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/dresses/new" style={{ textDecoration: "none" }}>
            <div style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.25)", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#C9A96E", fontFamily: "Tajawal" }}>إضافة</span>
            </div>
          </Link>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">فساتيني</div>
        <div className="page-sub">{dresses.length} فستان</div>
      </div>

      <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {dresses.length === 0 ? (
          <div style={{ gridColumn: "span 2" }} className="empty-state">
            <div className="empty-text" style={{ marginBottom: 20 }}>لا توجد فساتين بعد</div>
            <Link href="/dresses/new">
              <button className="btn-gold" style={{ width: "auto", padding: "12px 28px", borderRadius: 50 }}>أضيفي أول فستان</button>
            </Link>
          </div>
        ) : dresses.map(dress => (
          <div key={dress.id} style={{ background: "var(--card)", borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)" }}>
            <div style={{ position: "relative", aspectRatio: "3/4" }}>
              {dress.images?.[0]
                ? <img src={dress.images[0]} alt={dress.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
              }
              <div style={{ position: "absolute", top: 8, right: 8 }}>
                <span className="badge" style={{ background: dress.available ? "rgba(45,138,94,0.15)" : "rgba(192,57,43,0.15)", color: dress.available ? "var(--green)" : "var(--red)", fontSize: 10 }}>
                  {dress.available ? "متاح" : "محجوز"}
                </span>
              </div>
              {!dress.approved && (
                <div style={{ position: "absolute", top: 8, left: 8 }}>
                  <span className="badge" style={{ background: "rgba(212,136,10,0.15)", color: "var(--yellow)", fontSize: 10 }}>مراجعة</span>
                </div>
              )}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4, textAlign: "right" }}>{dress.name}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--gold3)", textAlign: "right", marginBottom: 10 }}>{dress.price} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => toggleAvailable(dress.id, dress.available)}
                  style={{ flex: 1, padding: "7px 4px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 11, background: dress.available ? "rgba(192,57,43,0.08)" : "rgba(45,138,94,0.08)", color: dress.available ? "var(--red)" : "var(--green)" }}>
                  {dress.available ? "إيقاف" : "تفعيل"}
                </button>
                <Link href={`/dresses/${dress.id}`} style={{ flex: 1 }}>
                  <button style={{ width: "100%", padding: "7px 4px", borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 11, background: "transparent", color: "var(--gold3)" }}>تعديل</button>
                </Link>
              </div>
              <button onClick={() => withdrawDress(dress)} disabled={withdrawing === dress.id}
                style={{ width: "100%", marginTop: 6, padding: "7px 4px", borderRadius: 10, border: "1px solid rgba(192,57,43,0.2)", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 11, background: "rgba(192,57,43,0.05)", color: "var(--red)", opacity: withdrawing === dress.id ? 0.6 : 1 }}>
                {withdrawing === dress.id ? "جاري السحب..." : "🗑️ سحب الفستان"}
              </button>
            </div>
          </div>
        ))}
      </div>
      <SellerNav />
    </div>
  );
}
