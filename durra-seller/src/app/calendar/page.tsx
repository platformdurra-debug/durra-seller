"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SellerNav from "@/components/SellerNav";

export default function CalendarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid), where("status", "in", ["confirmed", "active"])))
      .then(snap => { setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user, loading]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString("ar-BH", { month: "long", year: "numeric" });

  const bookedDays = new Set<number>();
  bookings.forEach(b => {
    if (!b.startDate?.seconds || !b.endDate?.seconds) return;
    const start = new Date(b.startDate.seconds * 1000);
    const end = new Date(b.endDate.seconds * 1000);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() === month && d.getFullYear() === year) bookedDays.add(d.getDate());
    }
  });

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 2 }}>SELLER</div>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">التقويم</div>
        <div className="page-sub">{bookedDays.size} يوم محجوز هذا الشهر</div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* Month Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, width: 38, height: 38, cursor: "pointer", color: "var(--text3)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{monthName}</div>
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, width: 38, height: 38, cursor: "pointer", color: "var(--text3)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>

        {/* Days Header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {["أح","اث","ث","أر","خ","ج","س"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, color: "var(--text4)", padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const isBooked = bookedDays.has(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            return (
              <div key={day} style={{ aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: isBooked ? "rgba(192,57,43,0.1)" : isToday ? "rgba(201,169,110,0.15)" : "var(--card)", border: `1px solid ${isBooked ? "rgba(192,57,43,0.25)" : isToday ? "rgba(201,169,110,0.4)" : "var(--border)"}` }}>
                <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: isBooked ? "var(--red)" : isToday ? "var(--gold3)" : "var(--text2)" }}>{day}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 20 }}>
          {[
            { color: "rgba(192,57,43,0.1)", border: "rgba(192,57,43,0.25)", textColor: "var(--red)", label: "محجوز" },
            { color: "rgba(201,169,110,0.15)", border: "rgba(201,169,110,0.4)", textColor: "var(--gold3)", label: "اليوم" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color, border: `1px solid ${l.border}` }} />
              <span style={{ fontSize: 11, color: "var(--text3)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <SellerNav />
    </div>
  );
}
