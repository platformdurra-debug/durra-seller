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
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.uid), where("status", "in", ["confirmed", "active"])))
      .then(snap => { setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

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

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", textAlign: "center" }}>التقويم</div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Month Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 16 }}>‹</button>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{monthName}</div>
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 16 }}>›</button>
        </div>

        {/* Days Header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {["أح","اث","ث","أر","خ","ج","س"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const isBooked = bookedDays.has(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            return (
              <div key={day} style={{ aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: isBooked ? "rgba(239,68,68,0.2)" : isToday ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.04)", border: isToday ? "1px solid rgba(201,169,110,0.5)" : "1px solid transparent" }}>
                <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: isBooked ? "#EF4444" : isToday ? "#C9A96E" : "rgba(255,255,255,0.6)" }}>{day}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 4, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>محجوز</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 4, background: "rgba(201,169,110,0.2)", border: "1px solid rgba(201,169,110,0.4)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>اليوم</span>
          </div>
        </div>
      </div>
      <SellerNav />
    </div>
  );
}
