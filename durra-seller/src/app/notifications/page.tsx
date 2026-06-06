"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SellerNav from "@/components/SellerNav";

const NOTIF_ICONS: Record<string, string> = {
  dress_approved:  "✅",
  dress_rejected:  "❌",
  new_booking:     "🎉",
  booking_completed: "💰",
  booking_cancelled: "↩️",
  default:         "🔔",
};

export default function SellerNotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    )).then(snap => {
      setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [user, loading]);

  const markRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.read);
    await Promise.all(unread.map(n => updateDoc(doc(db, "notifications", n.id), { read: true })));
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--gold3)", fontFamily: "Tajawal", fontWeight: 600 }}>
              قراءة الكل
            </button>
          )}
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">
          الإشعارات
          {unreadCount > 0 && (
            <span style={{ marginRight: 8, fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: "rgba(201,169,110,0.15)", color: "var(--gold3)" }}>
              {unreadCount} جديد
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {notifs.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div className="empty-text">لا توجد إشعارات</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifs.map(n => (
              <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                style={{ background: n.read ? "var(--card)" : "rgba(201,169,110,0.06)", borderRadius: 16, border: `1px solid ${n.read ? "var(--border)" : "rgba(201,169,110,0.2)"}`, padding: "14px 16px", cursor: n.read ? "default" : "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A96E", flexShrink: 0 }} />}
                      <div style={{ fontSize: 14, fontWeight: n.read ? 400 : 700, color: "var(--text)", textAlign: "right" }}>{n.title || "إشعار جديد"}</div>
                    </div>
                    {n.body && <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "right", lineHeight: 1.6 }}>{n.body}</div>}
                    <div style={{ fontSize: 10, color: "var(--text4)" }}>
                      {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleDateString("ar-BH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </div>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{NOTIF_ICONS[n.type] || NOTIF_ICONS.default}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SellerNav />
    </div>
  );
}
