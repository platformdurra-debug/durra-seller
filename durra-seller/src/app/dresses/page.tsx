"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SellerNav from "@/components/SellerNav";

export default function DressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dresses, setDresses] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "dresses"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc")))
      .then(snap => { setDresses(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

  const toggleAvailable = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "dresses", id), { available: !current });
    setDresses(prev => prev.map(d => d.id === id ? { ...d, available: !current } : d));
  };

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/dresses/new">
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A0E05" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
        </Link>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>فساتيني ({dresses.length})</div>
      </div>

      <div style={{ padding: "16px 16px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {dresses.length === 0 ? (
          <div style={{ gridColumn: "span 2", textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👗</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>لا توجد فساتين بعد</div>
            <Link href="/dresses/new">
              <button style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#1A0E05", border: "none", borderRadius: 50, padding: "12px 28px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>أضيفي أول فستان</button>
            </Link>
          </div>
        ) : dresses.map(dress => (
          <div key={dress.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ position: "relative", aspectRatio: "3/4" }}>
              {dress.images?.[0] ? (
                <img src={dress.images[0]} alt={dress.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "rgba(201,169,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>👗</div>
              )}
              {/* Status Badge */}
              <div style={{ position: "absolute", top: 8, right: 8, padding: "3px 10px", borderRadius: 20, background: dress.available ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)", border: `1px solid ${dress.available ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)"}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: dress.available ? "#34D399" : "#EF4444" }}>{dress.available ? "متاح" : "محجوز"}</span>
              </div>
              {/* Approved Badge */}
              {!dress.approved && (
                <div style={{ position: "absolute", top: 8, left: 8, padding: "3px 10px", borderRadius: 20, background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B" }}>قيد المراجعة</span>
                </div>
              )}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4, textAlign: "right" }}>{dress.name}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#C9A96E", textAlign: "right", marginBottom: 10 }}>{dress.price} د.ب</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => toggleAvailable(dress.id, dress.available)}
                  style={{ flex: 1, padding: "6px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 11, background: dress.available ? "rgba(239,68,68,0.15)" : "rgba(52,211,153,0.15)", color: dress.available ? "#EF4444" : "#34D399" }}>
                  {dress.available ? "إيقاف" : "تفعيل"}
                </button>
                <Link href={`/dresses/${dress.id}`} style={{ flex: 1 }}>
                  <button style={{ width: "100%", padding: "6px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 11, background: "rgba(201,169,110,0.15)", color: "#C9A96E" }}>
                    تعديل
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <SellerNav />
    </div>
  );
}
