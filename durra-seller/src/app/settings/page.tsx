"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SellerNav from "@/components/SellerNav";

export default function SellerSettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setName(d.displayName || ""); setPhone(d.phone || "");
        setWhatsapp(d.whatsapp || ""); setInstagram(d.instagram || "");
        setArea(d.area || ""); setDescription(d.description || "");
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [user, loading]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), { displayName: name, phone, whatsapp, instagram, area, description });
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {saved && <span style={{ fontSize: 12, color: "#34D399", fontWeight: 700 }}>✓ تم الحفظ</span>}
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">الإعدادات</div>
        <div className="page-sub">معلومات محلك</div>
      </div>

      <div style={{ padding: "16px" }}>
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14, fontWeight: 600 }}>معلومات المحل</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="input" placeholder="اسم المحل" value={name} onChange={e => setName(e.target.value)} />
            <input className="input" placeholder="المنطقة" value={area} onChange={e => setArea(e.target.value)} />
            <input className="input" placeholder="رقم الجوال" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
            <input className="input" placeholder="واتساب" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} type="tel" />
            <input className="input" placeholder="إنستقرام" value={instagram} onChange={e => setInstagram(e.target.value)} />
            <textarea className="input" placeholder="وصف المحل..." value={description} onChange={e => setDescription(e.target.value)} style={{ height: 90, resize: "none" }} />
          </div>
        </div>

        <button onClick={save} disabled={saving} className="btn-gold" style={{ marginBottom: 12 }}>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</button>

        <button onClick={logout} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "1px solid rgba(192,57,43,0.2)", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 700, fontSize: 14, background: "rgba(192,57,43,0.05)", color: "var(--red)" }}>
          تسجيل الخروج
        </button>
      </div>
      <SellerNav />
    </div>
  );
}
