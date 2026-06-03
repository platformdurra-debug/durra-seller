"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where, addDoc, serverTimestamp, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";

export default function AdminNotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("inbox");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [inbox, setInbox] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    getDocs(query(collection(db, "notifications"), where("userId", "==", "admin"), orderBy("createdAt", "desc")))
      .then(snap => { setInbox(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, []);

  const markRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
    setInbox(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const sendNotification = async () => {
    if (!title || !body) return;
    setSending(true);
    let usersSnap;
    if (target === "all") usersSnap = await getDocs(collection(db, "users"));
    else usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", target)));
    const batch = usersSnap.docs.map(u => addDoc(collection(db, "notifications"), { userId: u.id, title, body, read: false, createdAt: serverTimestamp() }));
    await Promise.all(batch);
    setSent(true); setSending(false);
    setTitle(""); setBody("");
    setTimeout(() => setSent(false), 3000);
  };

  const TARGETS = [
    { val: "all",      label: "الكل",       icon: "👥" },
    { val: "customer", label: "العرايس",    icon: "👰" },
    { val: "seller",   label: "المعرِضات", icon: "🏪" },
    { val: "provider", label: "المزودون",   icon: "🌸" },
  ];

  const TYPE_ICON: Record<string, string> = {
    new_dress: "👗", new_complaint: "⚠️", new_message: "💬",
    damage_report: "🔧", new_application: "📋", dress_withdrawal: "📤",
    new_booking: "🛍️",
  };

  const unreadCount = inbox.filter(n => !n.read).length;

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">الإشعارات</div>
          <div className="page-subtitle">{unreadCount} إشعار غير مقروء</div>
        </div>
        <div style={{ padding: "20px" }}>
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab-btn ${tab === "inbox" ? "active" : ""}`} onClick={() => setTab("inbox")}>الواردة ({unreadCount})</button>
            <button className={`tab-btn ${tab === "send" ? "active" : ""}`} onClick={() => setTab("send")}>إرسال إشعار</button>
          </div>

          {tab === "inbox" ? (
            fetching ? <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" /></div> :
            inbox.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text4)", padding: "40px 0" }}>لا توجد إشعارات واردة</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {inbox.map(n => (
                  <div key={n.id} className="card" onClick={() => !n.read && markRead(n.id)}
                    style={{ cursor: "pointer", background: n.read ? undefined : "rgba(201,169,110,0.04)", borderColor: n.read ? undefined : "rgba(201,169,110,0.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, color: "var(--text4)" }}>
                        {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleDateString("ar-BH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                      <div style={{ textAlign: "right", flex: 1, marginRight: 10 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                          {!n.read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C9A96E" }} />}
                          {n.title}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{n.body}</div>
                      </div>
                      <span style={{ fontSize: 18, marginLeft: 8 }}>{TYPE_ICON[n.type] || "🔔"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <>
              {sent && (
                <div style={{ padding: "14px 18px", borderRadius: 14, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", marginBottom: 20, textAlign: "center", fontSize: 15, color: "var(--green)", fontWeight: 700 }}>
                  ✓ تم الإرسال بنجاح!
                </div>
              )}
              <div className="card">
                <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 10, textAlign: "right" }}>إرسال لـ</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 20 }}>
                  {TARGETS.map(t => (
                    <button key={t.val} onClick={() => setTarget(t.val)}
                      style={{ padding: "10px 6px", borderRadius: 12, border: `1px solid ${target === t.val ? "rgba(201,169,110,0.3)" : "var(--border)"}`, cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 11, background: target === t.val ? "var(--gold-glow)" : "var(--card)", color: target === t.val ? "var(--gold)" : "var(--text3)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 20 }}>{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
                <input className="input" placeholder="عنوان الإشعار" value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: 12 }} />
                <textarea className="input" placeholder="نص الإشعار" value={body} onChange={e => setBody(e.target.value)} style={{ height: 100, resize: "none", marginBottom: 16 }} />
                <button onClick={sendNotification} disabled={sending || !title || !body} className="btn-gold">
                  {sending ? "جاري الإرسال..." : "إرسال الإشعار"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
