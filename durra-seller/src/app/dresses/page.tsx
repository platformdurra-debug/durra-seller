"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SellerNav from "@/components/SellerNav";

export default function DressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("published");
  const [dresses, setDresses] = useState<any[]>([]);     // المنشورة
  const [requests, setRequests] = useState<any[]>([]);   // الطلبات
  const [fetching, setFetching] = useState(false);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [discountDress, setDiscountDress] = useState<any>(null);
  const [discountPct, setDiscountPct] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [sendingDiscount, setSendingDiscount] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    Promise.all([
      getDocs(query(collection(db, "dresses"), where("sellerId", "==", user.uid))),
      getDocs(query(collection(db, "dressRequests"), where("sellerId", "==", user.uid))),
    ]).then(([dressSnap, reqSnap]) => {
      const byDate = (a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      setDresses(dressSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort(byDate));
      setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort(byDate));
      setFetching(false);
    }).catch((e) => { console.error(e); setFetching(false); });
  }, [user, loading]);

  const requestDiscount = async () => {
    if (!discountDress || !discountPct) { alert("أدخلي نسبة الخصم"); return; }
    const pct = Number(discountPct);
    if (pct < 1 || pct > 90) { alert("النسبة بين 1 و 90"); return; }
    setSendingDiscount(true);
    try {
      await addDoc(collection(db, "discountRequests"), {
        dressId: discountDress.id,
        dressName: discountDress.name || "",
        sellerId: user!.uid,
        sellerName: user!.displayName || "معرِضة",
        currentPrice: discountDress.price || 0,
        discountPct: pct,
        reason: discountReason || "",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "notifications"), {
        userId: "admin",
        type: "discount_request",
        title: "🏷️ طلب خصم جديد",
        body: (user!.displayName || "معرِضة") + " طلبت خصم " + pct + "% على " + (discountDress.name || "فستان"),
        read: false,
        createdAt: serverTimestamp(),
      });
      alert("تم إرسال طلب الخصم للإدارة ✅");
      setDiscountDress(null); setDiscountPct(""); setDiscountReason("");
    } finally { setSendingDiscount(false); }
  };

  const withdrawDress = async (dress: any) => {
    const activeBookings = await getDocs(query(
      collection(db, "bookings"),
      where("dressId", "==", dress.id),
      where("status", "in", ["confirmed", "active"])
    ));
    if (!activeBookings.empty) {
      alert("لا يمكن سحب الفستان — يوجد حجز نشط عليه حالياً. انتظري حتى انتهاء الحجز.");
      return;
    }
    if (!confirm("هل تريدين طلب سحب هذا الفستان من المنصة؟ سيتم إبلاغ الإدارة لإعادته لك.")) return;
    setWithdrawing(dress.id);
    try {
      await addDoc(collection(db, "notifications"), {
        userId: "admin",
        type: "dress_withdrawal",
        title: "📤 طلب سحب فستان",
        body: (dress.sellerName || "معرِضة") + " طلبت سحب فستان: " + dress.name,
        dressId: dress.id,
        read: false,
        createdAt: serverTimestamp(),
      });
      alert("تم إرسال طلب السحب للإدارة. سيتم التواصل معك لإعادة الفستان.");
    } finally {
      setWithdrawing(null);
    }
  };

  const STATUS: Record<string, { label: string; color: string; bg: string }> = {
    pending:  { label: "قيد المراجعة", color: "#92580A", bg: "rgba(212,136,10,0.12)" },
    rejected: { label: "مرفوض",        color: "#B91C1C", bg: "rgba(239,68,68,0.12)" },
    approved: { label: "تم النشر",     color: "#1A6B42", bg: "rgba(45,138,94,0.12)" },
  };

  if (fetching) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--gold)", fontSize: 32 }}>✦</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Tajawal, sans-serif", direction: "rtl", paddingBottom: 90 }}>
      <div style={{ padding: "52px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Link href="/dresses/new">
            <button className="btn-gold" style={{ padding: "10px 18px", fontSize: 13 }}>+ طلب فستان</button>
          </Link>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>فساتيني</div>
        </div>

        {/* تبويبات */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button onClick={() => setTab("published")}
            style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 700, fontSize: 13, background: tab === "published" ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "var(--card)", color: tab === "published" ? "#1A0E02" : "var(--text3)" }}>
            المنشورة ({dresses.length})
          </button>
          <button onClick={() => setTab("requests")}
            style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 700, fontSize: 13, background: tab === "requests" ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "var(--card)", color: tab === "requests" ? "#1A0E02" : "var(--text3)" }}>
            طلباتي ({requests.length})
          </button>
        </div>

        {/* المنشورة */}
        {tab === "published" && (
          dresses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--text3)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👗</div>
              <div style={{ fontSize: 14 }}>لا توجد فساتين منشورة بعد</div>
              <div style={{ fontSize: 12, marginTop: 6, color: "var(--text4)" }}>قدّمي طلب فستان وبعد موافقة الإدارة يظهر هنا</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {dresses.map(dress => (
                <div key={dress.id} style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
                  <img src={dress.images?.[0]} alt={dress.name} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{dress.name}</div>
                    <div style={{ fontSize: 12, color: "var(--gold3)", fontWeight: 700, marginBottom: 8 }}>{dress.price} د.ب / يوم</div>
                    {dress.rating > 0 && <div style={{ fontSize: 11, color: "#F59E0B", marginBottom: 8 }}>{"★".repeat(Math.round(dress.rating))} <span style={{ color: "var(--text4)" }}>({dress.reviewCount || 0})</span></div>}
                    {dress.discountPct > 0 && (
                      <div style={{ fontSize: 11, color: "#1A6B42", fontWeight: 700, marginBottom: 6, background: "rgba(45,138,94,0.1)", padding: "4px 8px", borderRadius: 8, textAlign: "center" }}>
                        🏷️ خصم {dress.discountPct}% نشط
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setDiscountDress(dress); setDiscountPct(""); setDiscountReason(""); }}
                        style={{ flex: 1, padding: "7px 4px", borderRadius: 10, border: "1px solid rgba(201,169,110,0.3)", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 11, background: "rgba(201,169,110,0.08)", color: "var(--gold3)" }}>
                        🏷️ طلب خصم
                      </button>
                      <button onClick={() => withdrawDress(dress)} disabled={withdrawing === dress.id}
                        style={{ flex: 1, padding: "7px 4px", borderRadius: 10, border: "1px solid rgba(192,57,43,0.2)", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 11, background: "rgba(192,57,43,0.05)", color: "var(--red)", opacity: withdrawing === dress.id ? 0.6 : 1 }}>
                        {withdrawing === dress.id ? "..." : "🗑️ سحب"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* الطلبات */}
        {tab === "requests" && (
          requests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--text3)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 14 }}>لا توجد طلبات</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {requests.map(req => {
                const st = STATUS[req.status] || STATUS.pending;
                return (
                  <div key={req.id} style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", padding: 12, display: "flex", gap: 12 }}>
                    <img src={req.images?.[0]} alt={req.name} style={{ width: 70, height: 88, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{req.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>السعر المقترح: {req.suggestedPrice} د.ب</div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
                      {req.status === "rejected" && req.rejectReason && (
                        <div style={{ fontSize: 11, color: "var(--red)", marginTop: 6 }}>السبب: {req.rejectReason}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* مودال طلب الخصم */}
      {discountDress && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setDiscountDress(null)}>
          <div style={{ background: "var(--card)", borderRadius: 20, padding: 24, maxWidth: 380, width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4, textAlign: "right" }}>طلب خصم 🏷️</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, textAlign: "right" }}>{discountDress.name} — {discountDress.price} د.ب</div>

            <input value={discountPct} onChange={e => setDiscountPct(e.target.value)} type="number" min="1" max="90" placeholder="نسبة الخصم %"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text)", fontFamily: "Tajawal", fontSize: 14, outline: "none", textAlign: "right", direction: "rtl", marginBottom: 10 }} />

            {discountPct && Number(discountPct) > 0 && Number(discountPct) <= 90 && (
              <div style={{ fontSize: 12, color: "var(--gold3)", textAlign: "right", marginBottom: 10 }}>
                السعر بعد الخصم: {Math.round(discountDress.price * (1 - Number(discountPct) / 100))} د.ب
              </div>
            )}

            <textarea value={discountReason} onChange={e => setDiscountReason(e.target.value)} placeholder="سبب الخصم (اختياري)"
              style={{ width: "100%", height: 70, padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text)", fontFamily: "Tajawal", fontSize: 13, outline: "none", resize: "none", textAlign: "right", direction: "rtl", marginBottom: 16 }} />

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDiscountDress(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--text3)", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600 }}>إلغاء</button>
              <button onClick={requestDiscount} disabled={sendingDiscount} className="btn-gold" style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 700, background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#1A0E02" }}>
                {sendingDiscount ? "..." : "إرسال الطلب"}
              </button>
            </div>
          </div>
        </div>
      )}
      <SellerNav />
    </div>
  );
}
